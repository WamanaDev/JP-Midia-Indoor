"use client";

import type { ComponentType } from "react";
import { QrCode } from "@/components/preview/shared/QrCode";
import type { NewsItem, NewsTogetherTemplateId } from "@/interfaces/Preview";

export interface NewsTogetherTemplateProps {
  items: NewsItem[];
}

function FilmstripRow({ items }: NewsTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-neutral-950 flex">
      {items.map((it, i) => (
        <div
          key={i}
          className={`flex-1 flex flex-col justify-center gap-2 px-6 ${i > 0 ? "border-l-2 border-dotted border-white/25" : ""}`}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">{it.source}</span>
          <span className="text-white text-xl font-bold leading-snug line-clamp-3">{it.title}</span>
          <span className="text-white/60 text-sm line-clamp-2">{it.description}</span>
        </div>
      ))}
    </div>
  );
}

function LedgerRows({ items }: NewsTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#f4f2ec] text-neutral-900 flex items-center justify-center px-16">
      <div className="w-full max-w-4xl flex flex-col divide-y divide-neutral-400/50">
        {items.map((it, i) => (
          <div key={i} className="py-4 flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{it.source}</span>
            <span className="font-serif text-2xl leading-snug">{it.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CarouselFan({ items }: NewsTogetherTemplateProps) {
  const rotate = [-8, 0, 8];
  return (
    <div className="relative w-full h-full bg-neutral-950 flex items-center justify-center">
      {items.slice(0, 3).map((it, i) => (
        <div
          key={i}
          className="absolute w-72 bg-white rounded-xl shadow-2xl p-5 flex flex-col gap-2"
          style={{ transform: `rotate(${rotate[i] ?? 0}deg) translateX(${(i - 1) * 40}px)`, zIndex: i === 1 ? 3 : i }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-600">{it.source}</span>
          <span className="text-neutral-900 text-base font-bold leading-snug line-clamp-3">{it.title}</span>
        </div>
      ))}
    </div>
  );
}

function InfoStripBottom({ items }: NewsTogetherTemplateProps) {
  return (
    <div className="relative w-full h-full flex items-end" style={{ background: "linear-gradient(160deg,#26314a,#0c101a)" }}>
      <div className="w-full bg-black/60 flex">
        {items.map((it, i) => (
          <div key={i} className={`flex-1 px-5 py-3 ${i > 0 ? "border-l border-white/15" : ""}`}>
            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400 block">{it.source}</span>
            <span className="text-white text-sm font-semibold line-clamp-2">{it.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const NEWSROOM_ACCENTS = ["border-amber-500", "border-teal-400", "border-blue-400"];

function NewsroomGrid({ items }: NewsTogetherTemplateProps) {
  return (
    <div className="w-full h-full grid gap-0.5" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((it, i) => (
        <div
          key={i}
          className={`bg-[#12151c] border-t-4 ${NEWSROOM_ACCENTS[i % NEWSROOM_ACCENTS.length]} px-5 py-6 flex flex-col gap-2`}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">{it.source}</span>
          <span className="text-white text-lg font-bold leading-snug line-clamp-4">{it.title}</span>
        </div>
      ))}
    </div>
  );
}

function ArchiveCards({ items }: NewsTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#e9e6de] flex items-center justify-center px-16">
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {items.map((it, i) => (
          <div
            key={i}
            className={`bg-white shadow px-5 py-3 flex items-center justify-between ${
              i % 2 === 1 ? "translate-x-2" : "-translate-x-2"
            }`}
          >
            <span className="text-neutral-900 text-lg font-semibold line-clamp-1">{it.title}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 flex-none ml-4">
              {it.source}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsWallQr({ items }: NewsTogetherTemplateProps) {
  return (
    <div className="w-full h-full grid gap-3 p-6" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((it, i) => (
        <div key={i} className="bg-[#12151c] rounded-lg p-5 flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">{it.source}</span>
          <span className="text-white text-base font-bold leading-snug line-clamp-3">{it.title}</span>
          <p className="text-white/60 text-xs line-clamp-2">{it.description}</p>
          <QrCode value={it.link} size={44} className="mt-auto" />
        </div>
      ))}
    </div>
  );
}

function NewsDigestList({ items }: NewsTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#f4f2ec] text-neutral-900 flex items-center justify-center px-16">
      <div className="w-full max-w-3xl flex flex-col gap-5">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col gap-1 border-t border-neutral-400/50 pt-4 first:border-t-0 first:pt-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{it.source}</span>
            <span className="text-xl font-bold leading-snug">{it.title}</span>
            <p className="text-neutral-600 text-sm line-clamp-2">{it.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const NEWS_TOGETHER_TEMPLATES: Record<NewsTogetherTemplateId, ComponentType<NewsTogetherTemplateProps>> = {
  "filmstrip-row": FilmstripRow,
  "ledger-rows": LedgerRows,
  "carousel-fan": CarouselFan,
  "info-strip-bottom": InfoStripBottom,
  "newsroom-grid": NewsroomGrid,
  "archive-cards": ArchiveCards,
  "news-wall-qr": NewsWallQr,
  "news-digest-list": NewsDigestList,
};
