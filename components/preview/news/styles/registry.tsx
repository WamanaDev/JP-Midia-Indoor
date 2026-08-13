"use client";

import type { ComponentType } from "react";
import { QrCode } from "@/components/preview/shared/QrCode";
import type { NewsItem, NewsOverlayStyleId } from "@/interfaces/Preview";

export type { NewsOverlayStyleId } from "@/interfaces/Preview";

export interface NewsStyleProps {
  item: NewsItem;
}

function TickerChip({ item }: NewsStyleProps) {
  return (
    <div className="flex items-center gap-2 bg-black/75 rounded-md px-4 py-2 max-w-md">
      <span className="w-2 h-2 rounded-full bg-red-500 flex-none" />
      <span className="text-white text-sm font-semibold truncate">{item.title}</span>
    </div>
  );
}

function Marquee({ item }: NewsStyleProps) {
  return (
    <div className="flex items-center gap-2 bg-black/75 rounded-md px-4 py-2 w-80 overflow-hidden">
      <span className="w-2 h-2 rounded-full bg-red-500 flex-none" />
      <div className="overflow-hidden flex-1">
        <span className="inline-block whitespace-nowrap pl-[100%] text-white text-sm font-semibold animate-[chip-marquee_9s_linear_infinite]">
          {item.title}
        </span>
      </div>
    </div>
  );
}

function MiniCard({ item }: NewsStyleProps) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl shadow-lg px-3 py-2 max-w-sm">
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-none" />
      ) : (
        <span className="w-12 h-12 rounded-lg flex-none bg-gradient-to-br from-amber-500 to-amber-800" />
      )}
      <span className="text-neutral-900 text-sm font-semibold line-clamp-2">{item.title}</span>
    </div>
  );
}

function AlertStrip({ item }: NewsStyleProps) {
  return (
    <div className="flex flex-col gap-1 bg-neutral-950 border-l-4 border-red-500 rounded-r-lg px-4 py-2 max-w-sm">
      <span className="text-red-400 text-[11px] font-mono uppercase tracking-wider">
        Última hora
      </span>
      <span className="text-white text-sm font-semibold truncate">{item.title}</span>
    </div>
  );
}

function QrCorner({ item }: NewsStyleProps) {
  return (
    <div className="flex items-center gap-3 bg-black/75 rounded-lg px-3 py-2 max-w-sm">
      <QrCode value={item.link} size={44} className="rounded flex-none" />
      <span className="text-white text-sm font-semibold truncate">{item.title}</span>
    </div>
  );
}

export const NEWS_OVERLAY_STYLES: Record<NewsOverlayStyleId, ComponentType<NewsStyleProps>> = {
  "news-ticker-chip": TickerChip,
  "news-marquee": Marquee,
  "news-mini-card": MiniCard,
  "news-alert-strip": AlertStrip,
  "news-qr-corner": QrCorner,
};
