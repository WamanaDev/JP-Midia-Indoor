import re
import sys

SRC = "clone_completo.sql"

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# Each pg_dump object block looks like:
# --
# -- Name: X; Type: Y; Schema: Z; Owner: W
# --
#
# <sql...>
#
HEADER_RE = re.compile(
    r"^--\n-- (?:Data for )?Name: (?P<name>.*?); Type: (?P<type>.*?); Schema: (?P<schema>.*?); Owner: .*?\n--\n",
    re.MULTILINE,
)

matches = list(HEADER_RE.finditer(content))

blocks = []
# preamble = everything before the first header (SET statements etc.)
preamble = content[: matches[0].start()] if matches else content

for i, m in enumerate(matches):
    start = m.start()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
    blocks.append(
        {
            "name": m.group("name"),
            "type": m.group("type"),
            "schema": m.group("schema"),
            "text": content[start:end],
        }
    )

print(f"Total blocks: {len(blocks)}", file=sys.stderr)

schema_ddl = []   # pre-data: schemas/types/tables/functions/sequences
data = []         # COPY blocks
post_data = []    # constraints/indexes/triggers/policies/publications

for b in blocks:
    is_public = b["schema"] == "public"
    is_cron_job = b["schema"] == "cron" and b["name"] in ("job",)

    if b["type"] == "TABLE DATA":
        if is_public or is_cron_job:
            data.append(b)
        continue

    if is_public or is_cron_job:
        if b["type"] in ("CONSTRAINT", "FK CONSTRAINT", "INDEX", "TRIGGER", "ROW SECURITY", "POLICY", "PUBLICATION TABLE"):
            post_data.append(b)
        else:
            schema_ddl.append(b)

# also grab the pg_cron extension creation + comment from preamble region (needed for cron.job)
ext_match = re.search(
    r"--\n-- Name: pg_cron; Type: EXTENSION.*?\n--\n\nCREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;\n",
    content,
    re.DOTALL,
)
pg_cron_ext = ext_match.group(0) if ext_match else ""

# sequence setvals relevant to what we kept (public.* and cron.jobid_seq, but NOT cron.runid_seq)
setval_re = re.compile(r"^SELECT pg_catalog\.setval\('([^']+)',.*\);$", re.MULTILINE)
kept_setvals = []
for sm in setval_re.finditer(content):
    seqname = sm.group(1)
    if seqname.startswith("public.") or seqname == "cron.jobid_seq":
        kept_setvals.append(sm.group(0))

header = """--
-- Bloco extraido de clone_completo.sql (schema public + cron.job)
-- Gerado para restaurar em um projeto Supabase novo/vazio.
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

"""

with open("migration/clone_01_schema.sql", "w", encoding="utf-8") as f:
    f.write(header)
    f.write("CREATE SCHEMA IF NOT EXISTS public;\n\n")
    if pg_cron_ext:
        f.write(pg_cron_ext + "\n")
    for b in schema_ddl:
        f.write(b["text"])
        if not b["text"].endswith("\n\n"):
            f.write("\n")

def decode_copy_value(raw):
    """Decode a single COPY text-format field into a Python value (None = SQL NULL)."""
    if raw == "\\N":
        return None
    out = []
    i, n = 0, len(raw)
    escapes = {"\\": "\\", "t": "\t", "n": "\n", "r": "\r", "b": "\b", "f": "\f", "v": "\v"}
    while i < n:
        c = raw[i]
        if c == "\\" and i + 1 < n:
            nc = raw[i + 1]
            if nc in escapes:
                out.append(escapes[nc])
                i += 2
                continue
            if nc.isdigit():
                j = i + 1
                digits = ""
                while j < n and raw[j].isdigit() and len(digits) < 3:
                    digits += raw[j]
                    j += 1
                out.append(chr(int(digits, 8)))
                i = j
                continue
            out.append(nc)
            i += 2
            continue
        out.append(c)
        i += 1
    return "".join(out)


def sql_literal(value):
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def copy_block_to_inserts(text, batch_size=500):
    """The Supabase SQL Editor runs plain SQL, not the psql COPY FROM STDIN
    wire protocol, so bulk-loading via COPY fails there. Convert each COPY
    block into equivalent INSERT INTO ... VALUES statements instead."""
    lines = text.split("\n")
    copy_idx = next(i for i, line in enumerate(lines) if line.startswith("COPY "))
    m = re.match(r"^COPY (\S+) \((.*)\) FROM stdin;$", lines[copy_idx])
    table, cols = m.group(1), m.group(2)

    data_lines = []
    for line in lines[copy_idx + 1:]:
        if line == "":
            break
        data_lines.append(line)

    rows = [[decode_copy_value(f) for f in line.split("\t")] for line in data_lines]

    out = []
    header_comment = "\n".join(lines[:copy_idx]).strip()
    if header_comment:
        out.append(header_comment)

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        values = ",\n".join(
            "  (" + ", ".join(sql_literal(v) for v in row) + ")" for row in batch
        )
        out.append(f"INSERT INTO {table} ({cols}) VALUES\n{values};")

    return "\n\n".join(out) + "\n\n"


def cron_job_block_to_schedule_calls(text):
    """cron.job only grants SELECT to the postgres role on Supabase - direct
    INSERT/COPY into it is permission-denied. Jobs must go through the
    cron.schedule() function instead."""
    lines = text.split("\n")
    copy_idx = next(i for i, line in enumerate(lines) if line.startswith("COPY "))
    m = re.match(r"^COPY (\S+) \((.*)\) FROM stdin;$", lines[copy_idx])
    cols = [c.strip() for c in m.group(2).split(",")]

    data_lines = []
    for line in lines[copy_idx + 1:]:
        if line == "":
            break
        data_lines.append(line)

    out = []
    header_comment = "\n".join(lines[:copy_idx]).strip()
    if header_comment:
        out.append(header_comment)

    for line in data_lines:
        row = dict(zip(cols, (decode_copy_value(f) for f in line.split("\t"))))
        out.append(
            "SELECT cron.schedule({jobname}, {schedule}, {command});".format(
                jobname=sql_literal(row["jobname"]),
                schedule=sql_literal(row["schedule"]),
                command=sql_literal(row["command"]),
            )
        )

    return "\n\n".join(out) + "\n\n"


with open("migration/clone_02_data.sql", "w", encoding="utf-8") as f:
    f.write(header)
    for b in data:
        if b["schema"] == "cron":
            f.write(cron_job_block_to_schedule_calls(b["text"]))
        else:
            f.write(copy_block_to_inserts(b["text"]))
    if kept_setvals:
        f.write("\n".join(s for s in kept_setvals if not s.startswith("SELECT pg_catalog.setval('cron.")) + "\n")

with open("migration/clone_03_post_data.sql", "w", encoding="utf-8") as f:
    f.write(header)
    for b in post_data:
        text = b["text"]
        # FKs to auth.users can't be validated against a fresh project
        # (no matching auth.users rows) - add them NOT VALID so the
        # constraint still exists for the future without failing now.
        if "REFERENCES auth.users(id)" in text:
            text = text.rstrip("\n")
            text = text[:-1] + " NOT VALID;\n"
        f.write(text)
        if not text.endswith("\n\n"):
            f.write("\n")

print("schema_ddl blocks:", len(schema_ddl), file=sys.stderr)
print("data blocks:", len(data), file=sys.stderr)
print("post_data blocks:", len(post_data), file=sys.stderr)
print("kept setvals:", kept_setvals, file=sys.stderr)
