"use client";

import type { ComponentType } from "react";
import { QrCode } from "@/components/preview/shared/QrCode";
import type { NewsItem, NewsRotateTemplateId } from "@/interfaces/Preview";

export interface NewsRotateTemplateProps {
  item: NewsItem;
}

function bgImageStyle(image: string | undefined, fallback: string) {
  return image
    ? { backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.85), transparent 55%), url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: fallback };
}

/** Sem descrição de propósito — desenhado pra ser lido em 2 segundos, tipo lower-third de telejornal. */
function BroadcastLowerThird({ item }: NewsRotateTemplateProps) {
  return (
    <div className="relative w-full h-full flex items-end" style={bgImageStyle(item.image, "linear-gradient(160deg,#1c2c46,#0c1120)")}>
      <div className="w-full bg-amber-500 text-neutral-950 px-8 py-4 flex items-center gap-4 animate-[slide-in-left_0.5s_ease-out]">
        <span className="font-mono text-xs uppercase tracking-wider bg-neutral-950 text-amber-400 px-2 py-1 rounded flex-none">
          {item.source}
        </span>
        <span className="text-2xl md:text-3xl font-bold truncate">{item.title}</span>
      </div>
    </div>
  );
}

function MagazineCover({ item }: NewsRotateTemplateProps) {
  return (
    <div className="relative w-full h-full bg-[#f4f2ec] text-neutral-900 flex flex-col justify-center px-16 gap-6">
      <div className="absolute top-[16%] left-16 right-16 h-px bg-neutral-900/25" />
      <div className="absolute bottom-[16%] left-16 right-16 h-px bg-neutral-900/25" />
      <span className="text-neutral-500 text-sm uppercase tracking-widest">{item.source}</span>
      <h1 className="font-serif text-5xl md:text-6xl leading-tight max-w-4xl">{item.title}</h1>
      <p className="text-neutral-600 text-xl max-w-2xl line-clamp-3">{item.description}</p>
      <div className="absolute right-16 bottom-[8%] flex flex-col items-center gap-1">
        <QrCode value={item.link} size={64} />
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">leia mais</span>
      </div>
    </div>
  );
}

function NewsHeroBanner({ item }: NewsRotateTemplateProps) {
  return (
    <div className="relative w-full h-full flex items-end" style={bgImageStyle(item.image, "linear-gradient(160deg,#3a2f55,#111726)")}>
      <div className="p-10 w-full flex items-end justify-between gap-8">
        <div className="flex flex-col gap-3 max-w-3xl">
          <span className="self-start font-mono text-xs uppercase tracking-wider bg-amber-500 text-neutral-950 px-2 py-1 rounded">
            {item.source}
          </span>
          <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight">{item.title}</h1>
          <p className="text-white/75 text-lg line-clamp-2">{item.description}</p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-none">
          <QrCode value={item.link} size={72} />
          <span className="text-[10px] uppercase tracking-wide text-white/70">matéria completa</span>
        </div>
      </div>
    </div>
  );
}

function GalleryFrame({ item }: NewsRotateTemplateProps) {
  return (
    <div className="relative w-full h-full bg-[#efece4] text-neutral-900 flex flex-col items-center justify-center px-20 gap-4">
      <div className="absolute inset-8 border border-neutral-400/60" />
      <h1 className="font-serif text-4xl text-center max-w-3xl">{item.title}</h1>
      <p className="text-neutral-600 text-lg text-center max-w-2xl line-clamp-3">{item.description}</p>
      <div className="mt-2 flex flex-col items-center gap-1">
        <QrCode value={item.link} size={56} />
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">{item.source}</span>
      </div>
    </div>
  );
}

function PolaroidFrame({ item }: NewsRotateTemplateProps) {
  return (
    <div className="relative w-full h-full bg-[#e9e6de] flex items-center justify-center">
      <div className="relative bg-white shadow-2xl px-6 pt-6 pb-16 -rotate-3 w-[70%] max-w-xl">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-amber-400 to-amber-700" />
        )}
        <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded">
          {item.source}
        </span>
        <h1 className="mt-2 text-neutral-900 text-xl font-bold leading-snug line-clamp-2">{item.title}</h1>
        <div className="absolute right-4 bottom-4 rotate-6">
          <QrCode value={item.link} size={40} />
        </div>
      </div>
    </div>
  );
}

function NewsSplitQr({ item }: NewsRotateTemplateProps) {
  return (
    <div className="w-full h-full flex">
      <div
        className="flex-1"
        style={{
          backgroundImage: item.image ? `url(${item.image})` : "linear-gradient(160deg,#3a2f55,#111726)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="flex-1 bg-neutral-950 flex flex-col justify-center gap-4 px-10">
        <span className="self-start font-mono text-xs uppercase tracking-wider bg-amber-500 text-neutral-950 px-2 py-1 rounded">
          {item.source}
        </span>
        <h1 className="text-white text-3xl font-bold leading-tight">{item.title}</h1>
        <p className="text-white/70 text-lg line-clamp-4">{item.description}</p>
        <div className="flex items-center gap-3 mt-2">
          <QrCode value={item.link} size={64} />
          <span className="text-white/60 text-sm max-w-[10ch]">Matéria completa</span>
        </div>
      </div>
    </div>
  );
}

function NewsCaptionCard({ item }: NewsRotateTemplateProps) {
  return (
    <div className="relative w-full h-full bg-neutral-950 flex items-center justify-center px-16">
      <div className="bg-white/5 border border-white/15 rounded-2xl px-12 py-10 max-w-3xl flex flex-col gap-4">
        <span className="font-serif italic text-white text-3xl leading-snug">&ldquo;{item.title}&rdquo;</span>
        <p className="text-white/70 text-lg line-clamp-3">{item.description}</p>
        <span className="font-mono text-xs uppercase tracking-wider text-amber-400">{item.source}</span>
      </div>
      <div className="absolute right-10 bottom-10">
        <QrCode value={item.link} size={56} />
      </div>
    </div>
  );
}

function NewsDossier({ item }: NewsRotateTemplateProps) {
  return (
    <div className="relative w-full h-full bg-[#efece4] text-neutral-900 flex flex-col justify-center px-16 gap-4">
      <span className="absolute top-[6%] left-[14%] w-16 h-10 border-4 border-neutral-400 rounded -rotate-6" />
      <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">{item.source}</span>
      <h1 className="font-serif text-4xl max-w-3xl">{item.title}</h1>
      <p className="text-neutral-700 text-lg max-w-2xl line-clamp-4">{item.description}</p>
      <div className="absolute right-16 bottom-[10%]">
        <QrCode value={item.link} size={56} />
      </div>
    </div>
  );
}

function NewsAnchorDesk({ item }: NewsRotateTemplateProps) {
  return (
    <div className="relative w-full h-full flex items-end" style={bgImageStyle(item.image, "linear-gradient(160deg,#2c3f66,#0d1120)")}>
      <div className="w-full bg-neutral-950/90 text-white flex flex-col gap-2 px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wider bg-amber-500 text-neutral-950 px-2 py-1 rounded flex-none">
            {item.source}
          </span>
          <span className="text-2xl font-bold truncate">{item.title}</span>
        </div>
        <div className="overflow-hidden border-t border-white/15 pt-2">
          <span className="inline-block whitespace-nowrap pl-[100%] text-white/70 text-base animate-[chip-marquee_16s_linear_infinite]">
            {item.description}
          </span>
        </div>
      </div>
    </div>
  );
}

export const NEWS_ROTATE_TEMPLATES: Record<NewsRotateTemplateId, ComponentType<NewsRotateTemplateProps>> = {
  "broadcast-lower-third": BroadcastLowerThird,
  "magazine-cover": MagazineCover,
  "news-hero-banner": NewsHeroBanner,
  "gallery-frame": GalleryFrame,
  "polaroid-frame": PolaroidFrame,
  "news-split-qr": NewsSplitQr,
  "news-caption-card": NewsCaptionCard,
  "news-dossier": NewsDossier,
  "news-anchor-desk": NewsAnchorDesk,
};
