import { useEffect, useState } from "react";
import { Metropole } from "./Metropoles";
import { G1 } from "./G1";

type NewsConfig = {
  news: Record<string, string[]>;
};

interface NewsProps {
  config: NewsConfig;
}

type NewsItem = {
  title: string;
  description: string;
  link: string;
  image?: string;
  source: string;
};

export function News({ config }: NewsProps) {
  const [item, setItem] = useState<NewsItem | null>(null);

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

        const merged = responses.flat();

        if (alive && merged.length > 0) {
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
  }, [config.news]);

  if (!item) {
    return <div className="text-white">Carregando notícias…</div>;
  }

  if (item.source === "Metrópole") {
    return <Metropole item={item} />;
  }

  if (item.source === "G1") {
    return <G1 item={item} />;
  }
}
