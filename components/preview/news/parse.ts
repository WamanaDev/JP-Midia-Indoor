import { XMLParser } from "fast-xml-parser";

type NewsItem = {
  title: string;
  description: string;
  link: string;
  source: string;
  image?: string;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
});

function extractImageFromHTML(html?: string): string | undefined {
  if (!html || typeof html !== "string") return;

  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

function cleanDescription(html?: string): string {
  if (!html || typeof html !== "string") return "";

  return (
    html
      // remove tags <img>
      .replace(/<img[^>]*>/gi, "")
      // remove <br>, <br/> etc
      .replace(/<br\s*\/?>/gi, " ")
      // remove qualquer outra tag HTML
      .replace(/<\/?[^>]+>/gi, "")
      // normaliza espaços
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function parseRSSNormalized(xml: string, source: string): NewsItem[] {
  const json = parser.parse(xml);

  const channel = json?.rss?.channel;
  if (!channel) return [];

  const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];

  return rawItems
    .map((item: any): NewsItem => {
      const media =
        item["media:content"] || item.media?.content || item.mediaContent;

      const enclosure = item.enclosure;

      const image =
        media?.url ||
        enclosure?.url ||
        extractImageFromHTML(item["content"] || item["content:encoded"]) ||
        extractImageFromHTML(item.description);

      return {
        title: item.title ?? "",
        description: cleanDescription(
          item.description ?? item["content"] ?? item["content:encoded"] ?? ""
        ),
        link: item.link ?? "",
        source,
        image,
      };
    })
    .filter((i: NewsItem) => i.title && i.link);
}
