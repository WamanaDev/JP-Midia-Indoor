"use client";

import { useEffect, useMemo, useState } from "react";
import { Metropole } from "./Metropoles";
import { G1 } from "./G1";

/* ================= TYPES ================= */

type NewsConfig = {
  news: Record<string, string[]>;
  interval?: number;
};

type NewsItem = {
  title: string;
  description: string;
  link: string;
  image?: string;
  source: string;
};

interface NewsOverlayProps {
  config: NewsConfig;
}

/* ================= COMPONENT ================= */
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function NewsOverlay({ config }: NewsOverlayProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const SHOW_MS = (config.interval ?? 10) * 2000;
  const ANIMATION_MS = 500;
  const GAP_MS = 3000;

  const newsSignature = useMemo(
    () => JSON.stringify(config.news ?? {}),
    [config.news]
  );

  /* ===== LOAD RSS ===== */
  useEffect(() => {
    let alive = true;

    async function load() {
      const res = await fetch("/api/player/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          news: config.news,
          limit: 40,
          shuffle: true,
        }),
      });

      if (!res.ok) return;

      const json = await res.json();

      if (alive && json.items?.length) {
        setItems(json.items);
        setIndex(Math.floor(Math.random() * json.items.length));
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [newsSignature]);

  /* ===== ROTATION LOOP ===== */
  useEffect(() => {
    if (!items.length) return;

    let cancelled = false;

    async function cycle() {
      while (!cancelled) {
        setVisible(true);
        await sleep(SHOW_MS);

        setVisible(false);
        await sleep(ANIMATION_MS);

        setIndex((i) => (i + 1) % items.length);
        await sleep(GAP_MS);
      }
    }

    cycle();
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (!items.length) {
    return (
      <div className="text-white text-sm px-4 py-2 opacity-70">
        Carregando notícias…
      </div>
    );
  }

  const item = items[index];

  return (
    <div className="pointer-events-none select-none fixed bottom-6 left-1/4 -translate-x-1/4 z-30">
      <div
        className={`
          transition-all duration-500 ease-out transform
          ${
            visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }
        `}
      >
        {item.source === "Metrópole" && <Metropole overlay item={item} />}
        {item.source === "G1" && <G1 overlay item={item} />}
      </div>
    </div>
  );
}
