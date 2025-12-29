import { parseRSSNormalized } from "@/components/preview/news/parse";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

    const res = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch RSS: ${res.status}`);
    }

    const xml = await res.text();

    const items = parseRSSNormalized(xml, source);

    return NextResponse.json(items);
  } catch (err) {
    console.error("RSS ROUTE ERROR:", err);
    return NextResponse.json({ error: "RSS parse failed" }, { status: 500 });
  }
}
