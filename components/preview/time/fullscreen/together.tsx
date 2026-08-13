"use client";

import type { ComponentType } from "react";
import type { TimeTogetherTemplateId } from "@/interfaces/Preview";

export interface TimeTogetherEntry {
  time: string;
  label: string;
  hourDeg: number;
  minuteDeg: number;
}

export interface TimeTogetherTemplateProps {
  clocks: TimeTogetherEntry[];
}

function DepartureTable({ clocks }: TimeTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#0a0d13] flex items-center justify-center px-16">
      <div className="w-full max-w-3xl flex flex-col divide-y divide-white/10">
        {clocks.map((c, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <span className="text-white/80 text-2xl uppercase tracking-wide">{c.label}</span>
            <span className="font-mono text-white text-4xl tabular-nums">{c.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const RIBBON_COLORS = ["bg-teal-400 text-teal-950", "bg-amber-400 text-amber-950", "bg-blue-400 text-blue-950", "bg-rose-400 text-rose-950"];

function RibbonStack({ clocks }: TimeTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#0d0f14] flex flex-col items-center justify-center gap-3 px-16">
      {clocks.map((c, i) => (
        <div
          key={i}
          className={`w-full max-w-2xl flex items-center justify-between px-6 py-3 rounded ${RIBBON_COLORS[i % RIBBON_COLORS.length]}`}
        >
          <span className="font-semibold uppercase tracking-wide text-sm">{c.label}</span>
          <span className="font-mono text-2xl tabular-nums">{c.time}</span>
        </div>
      ))}
    </div>
  );
}

function ClockWall({ clocks }: TimeTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#0d1119] flex flex-wrap items-center justify-center gap-10 p-10">
      {clocks.map((c, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full border-2 border-white/60 relative">
            <div
              className="absolute w-1 h-7 bg-white top-5 left-1/2 origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${c.hourDeg}deg)` }}
            />
            <div
              className="absolute w-0.5 h-10 bg-white top-3 left-1/2 origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${c.minuteDeg}deg)` }}
            />
            <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-white/70 text-sm uppercase tracking-wide">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function GlassPanels({ clocks }: TimeTogetherTemplateProps) {
  return (
    <div className="w-full h-full flex bg-[#0d1119]">
      {clocks.map((c, i) => (
        <div
          key={i}
          className={`flex-1 flex flex-col items-center justify-center gap-2 bg-white/5 ${i > 0 ? "border-l border-white/15" : ""}`}
        >
          <span className="text-white/70 text-lg uppercase tracking-wide">{c.label}</span>
          <span className="font-mono text-white text-5xl tabular-nums">{c.time}</span>
        </div>
      ))}
    </div>
  );
}

function TimelineRow({ clocks }: TimeTogetherTemplateProps) {
  return (
    <div className="relative w-full h-full bg-[#0d1119] flex items-start justify-center pt-24 px-16">
      <div className="absolute top-24 left-16 right-16 h-px bg-white/25" />
      <div className="w-full flex justify-between">
        {clocks.map((c, i) => (
          <div key={i} className="relative flex flex-col items-center gap-2 -mt-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="font-mono text-white text-3xl tabular-nums mt-4">{c.time}</span>
            <span className="text-white/60 text-sm uppercase tracking-wide">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CorporateLobby({ clocks }: TimeTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center gap-16 px-16">
      {clocks.map((c, i) => (
        <div key={i} className="flex flex-col items-center gap-2 pb-3 border-b-2 border-blue-500">
          <span className="font-mono text-neutral-900 text-4xl tabular-nums">{c.time}</span>
          <span className="text-neutral-500 text-sm uppercase tracking-wide">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function TransitMultiboard({ clocks }: TimeTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center px-16">
      <div className="w-full max-w-3xl flex flex-col gap-3">
        {clocks.map((c, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-amber-400/70 text-lg uppercase tracking-wide">{c.label}</span>
            <span className="font-mono text-amber-400 text-3xl tabular-nums [text-shadow:0_0_8px_rgba(245,166,35,0.5)]">
              {c.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const TIME_TOGETHER_TEMPLATES: Record<TimeTogetherTemplateId, ComponentType<TimeTogetherTemplateProps>> = {
  "departure-table": DepartureTable,
  "ribbon-stack": RibbonStack,
  "clock-wall": ClockWall,
  "glass-panels": GlassPanels,
  "timeline-row": TimelineRow,
  "corporate-lobby": CorporateLobby,
  "transit-multiboard": TransitMultiboard,
};
