"use client";

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { WeatherTogetherTemplateId } from "@/interfaces/Preview";

export interface WeatherTogetherEntry {
  value: string;
  label: string;
  Icon: LucideIcon;
}

export interface WeatherTogetherTemplateProps {
  locations: WeatherTogetherEntry[];
}

function GridMosaic({ locations }: WeatherTogetherTemplateProps) {
  return (
    <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${locations.length}, 1fr)` }}>
      {locations.map((l, i) => (
        <div
          key={i}
          className={`flex flex-col items-center justify-center gap-2 bg-[#151a24] ${i > 0 ? "border-l border-white/10" : ""}`}
        >
          <l.Icon className="w-8 h-8 text-white/70" />
          <span className="font-mono text-white text-4xl tabular-nums">{l.value}</span>
          <span className="text-white/60 text-sm uppercase tracking-wide">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardTiles({ locations }: WeatherTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-neutral-200 flex items-center justify-center gap-6 px-10">
      {locations.map((l, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center gap-2">
          <l.Icon className="w-8 h-8 text-neutral-500" />
          <span className="font-mono text-neutral-900 text-4xl tabular-nums">{l.value}</span>
          <span className="text-neutral-500 text-sm uppercase tracking-wide">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function Honeycomb({ locations }: WeatherTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#0d1119] flex items-center justify-center gap-4 px-10">
      {locations.map((l, i) => (
        <div
          key={i}
          className="w-40 h-40 flex flex-col items-center justify-center gap-1 bg-[#151d2c]"
          style={{ clipPath: "polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)" }}
        >
          <l.Icon className="w-7 h-7 text-white/70" />
          <span className="font-mono text-white text-2xl tabular-nums">{l.value}</span>
          <span className="text-white/50 text-[10px] uppercase tracking-wide">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function WeatherStripMulti({ locations }: WeatherTogetherTemplateProps) {
  return (
    <div
      className="w-full h-full flex items-end justify-center gap-10 pb-12"
      style={{ background: "linear-gradient(180deg,#3c6ea5 0%,#3c6ea5 55%,#16324d 55%,#16324d 100%)" }}
    >
      {locations.map((l, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <l.Icon className="w-9 h-9 text-white" />
          <span className="font-mono text-white text-3xl tabular-nums">{l.value}</span>
          <span className="text-white/70 text-xs uppercase tracking-wide">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function SplitDuo({ locations }: WeatherTogetherTemplateProps) {
  return (
    <div className="w-full h-full flex bg-[#0d1119]">
      {locations.slice(0, 2).map((l, i) => (
        <div
          key={i}
          className={`flex-1 flex flex-col items-center justify-center gap-2 ${i === 0 ? "border-r border-white/20" : ""}`}
        >
          <l.Icon className="w-10 h-10 text-white/80" />
          <span className="font-mono text-white text-5xl tabular-nums">{l.value}</span>
          <span className="text-white/60 text-sm uppercase tracking-wide">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function BadgeCloud({ locations }: WeatherTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#0d1119] flex flex-wrap items-center justify-center gap-4 p-10">
      {locations.map((l, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-6 py-3 ${
            i % 2 === 1 ? "-translate-y-2" : ""
          }`}
        >
          <l.Icon className="w-6 h-6 text-white/80" />
          <span className="font-mono text-white text-2xl tabular-nums">{l.value}</span>
          <span className="text-white/60 text-xs uppercase tracking-wide">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function GlobeRow({ locations }: WeatherTogetherTemplateProps) {
  return (
    <div className="w-full h-full bg-[#0d1119] flex items-center justify-center gap-10">
      {locations.map((l, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-full"
            style={{ background: "radial-gradient(circle at 35% 30%,#7fc7f5,#1b4f7a 70%)" }}
          />
          <span className="font-mono text-white text-2xl tabular-nums">{l.value}</span>
          <span className="text-white/60 text-xs uppercase tracking-wide">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

export const WEATHER_TOGETHER_TEMPLATES: Record<WeatherTogetherTemplateId, ComponentType<WeatherTogetherTemplateProps>> = {
  "grid-mosaic": GridMosaic,
  "dashboard-tiles": DashboardTiles,
  honeycomb: Honeycomb,
  "weather-strip-multi": WeatherStripMulti,
  "split-duo": SplitDuo,
  "badge-cloud": BadgeCloud,
  "globe-row": GlobeRow,
};
