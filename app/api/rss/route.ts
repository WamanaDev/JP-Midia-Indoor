import { parseRSSNormalized } from "@/components/preview/news/parse";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { safeFetch, UnsafeUrlError } from "@/lib/safe-fetch";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!rateLimit(getClientIp(req))) {
    return NextResponse.json(
      { error: "Muitas requisições, tente novamente em instantes" },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const source = searchParams.get("source");

    if (!url || !source) {
      return NextResponse.json(
        { error: "Missing url or source" },
        { status: 400 }
      );
    }

    const res = await safeFetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      throw new Error(`Failed to fetch RSS: ${res.status}`);
    }

    const xml = await res.text();

    const items = parseRSSNormalized(xml, source);

    return NextResponse.json(items);
  } catch (err) {
    if (err instanceof UnsafeUrlError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("RSS ROUTE ERROR:", err);
    return NextResponse.json({ error: "RSS parse failed" }, { status: 500 });
  }
}
