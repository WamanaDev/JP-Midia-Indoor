"use client";

import { useEffect, useState } from "react";
import { Metropole } from "./Metropoles";
import { G1 } from "./G1";
import { NewsFullscreenTemplateId, NewsItem, NewsRotateTemplateId, NewsTogetherTemplateId } from "@/interfaces/Preview";
import { NEWS_ROTATE_TEMPLATES } from "./fullscreen/registry";
import { NEWS_TOGETHER_TEMPLATES } from "./fullscreen/together";

const TOGETHER_ITEM_COUNT = 3;

type NewsConfig = {
  news: Record<string, string[]>;
  /** Ausente = visual atual (fixo por fonte, G1/Metrópole). */
  fullscreenStyle?: NewsFullscreenTemplateId;
};

interface NewsProps {
  config: NewsConfig;
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function News({ config }: NewsProps) {
  const [item, setItem] = useState<NewsItem | null>(null);
  const [items, setItems] = useState<NewsItem[]>([]);

  const TogetherTemplate = config.fullscreenStyle
    ? NEWS_TOGETHER_TEMPLATES[config.fullscreenStyle as NewsTogetherTemplateId]
    : undefined;

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const responses = await Promise.all(
          Object.entries(config.news).flatMap(([source, urls]) =>
            urls.map(async (url) => {
              const res = await fetch(
                `/api/rss?url=${encodeURIComponent(
                  url
                )}&source=${encodeURIComponent(source)}`
              );

              if (!res.ok) {
                console.error("RSS ERROR", source, url);
                return [];
              }

              return res.json();
            })
          )
        );

        const merged: NewsItem[] = responses.flat();
        if (!alive || merged.length === 0) return;

        if (TogetherTemplate) {
          setItems(shuffle(merged).slice(0, TOGETHER_ITEM_COUNT));
        } else {
          setItem(merged[Math.floor(Math.random() * merged.length)]);
        }
      } catch (err) {
        console.error("Failed to load news", err);
      }
    }

    load();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.news, !!TogetherTemplate]);

  if (TogetherTemplate) {
    if (!items.length) {
      return <div className="text-white">Carregando notícias…</div>;
    }
    return <TogetherTemplate items={items} />;
  }

  if (!item) {
    return <div className="text-white">Carregando notícias…</div>;
  }

  const RotateTemplate = config.fullscreenStyle
    ? NEWS_ROTATE_TEMPLATES[config.fullscreenStyle as NewsRotateTemplateId]
    : undefined;

  if (RotateTemplate) {
    return <RotateTemplate item={item} />;
  }

  if (item.source === "Metrópole") {
    return <Metropole overlay={false} item={item} />;
  }

  if (item.source === "G1") {
    return <G1 overlay={false} item={item} />;
  }
}
