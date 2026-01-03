import { parseRSSNormalized } from "@/components/preview/news/parse";
import { NextResponse } from "next/server";

/* ================= TYPES ================= */

type NewsItem = {
  title: string;
  description: string;
  link: string;
  image?: string;
  source: string;
};

type NewsRequest = {
  news: Record<string, string[]>;
  limit?: number;
  shuffle?: boolean;
};

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NewsRequest;

    if (!body.news || Object.keys(body.news).length === 0) {
      return NextResponse.json({ items: [] });
    }

    const responses = await Promise.all(
      Object.entries(body.news).flatMap(([source, urls]) =>
        urls.map(async (url) => {
          try {
            const res = await fetch(url, {
              // 🔥 cache inteligente por 5 minutos
              next: { revalidate: 3600 },
            });

            if (!res.ok) return [];

            const xml = await res.text();
            return parseRSSNormalized(xml, source);
          } catch {
            return [];
          }
        })
      )
    );

    let items: NewsItem[] = responses.flat();

    /* ================= NORMALIZA ================= */

    if (body.shuffle !== false) {
      items = shuffle(items);
    }

    if (body.limit) {
      items = items.slice(0, body.limit);
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("NEWS API ERROR", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

/* ================= UTILS ================= */

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
