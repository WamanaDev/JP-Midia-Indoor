"use client";

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { WeatherRotateTemplateId } from "@/interfaces/Preview";

export interface WeatherRotateTemplateProps {
  value: string;
  label: string;
  Icon: LucideIcon;
}

function BillboardSpot({ value, label, Icon }: WeatherRotateTemplateProps) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-4"
      style={{ background: "radial-gradient(circle at 50% 40%, #2d4a86 0%, #0a0d16 68%)" }}
    >
      <Icon className="w-16 h-16 text-white/90" />
      <span className="font-mono text-white text-8xl md:text-9xl tabular-nums">{value}</span>
      <span className="text-white/70 text-xl uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function ControlRoom({ value, label, Icon }: WeatherRotateTemplateProps) {
  return (
    <div
      className="relative w-full h-full bg-[#0a0f16] flex flex-col items-center justify-center gap-3"
      style={{
        backgroundImage:
          "linear-gradient(rgba(94,234,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.08) 1px, transparent 1px)",
        backgroundSize: "14% 20%",
      }}
    >
      <span className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-teal-300" />
      <span className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-teal-300" />
      <Icon className="w-14 h-14 text-teal-300" />
      <span className="font-mono text-teal-300 text-7xl md:text-8xl tabular-nums">{value}</span>
      <span className="text-teal-300/70 text-lg uppercase tracking-[0.25em]">{label}</span>
    </div>
  );
}

function RetailPromo({ value, label, Icon }: WeatherRotateTemplateProps) {
  return (
    <div className="w-full h-full bg-amber-500 flex flex-col items-center justify-center gap-4">
      <div className="bg-white rounded-3xl px-12 py-8 flex flex-col items-center gap-2 shadow-xl">
        <Icon className="w-10 h-10 text-amber-600" />
        <span className="font-mono text-neutral-900 text-7xl md:text-8xl tabular-nums">{value}</span>
      </div>
      <span className="text-amber-950 text-xl font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );
}

function WeatherStationHero({ value, label, Icon }: WeatherRotateTemplateProps) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: "linear-gradient(200deg, #3c6ea5, #16324d)" }}
    >
      <Icon className="w-20 h-20 text-white drop-shadow" />
      <span className="font-mono text-white text-8xl md:text-9xl tabular-nums">{value}</span>
      <span className="text-white/80 text-xl uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function CorporateBrief({ value, label, Icon }: WeatherRotateTemplateProps) {
  return (
    <div className="relative w-full h-full bg-white flex flex-col justify-center px-16 gap-3">
      <Icon className="w-10 h-10 text-neutral-400" />
      <span className="font-mono text-neutral-900 text-7xl md:text-8xl tabular-nums">{value}</span>
      <span className="text-neutral-500 text-xl uppercase tracking-wide">{label}</span>
      <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-end gap-3 h-32">
        <span className="w-6 bg-blue-500/70 h-[40%]" />
        <span className="w-6 bg-blue-500/70 h-[70%]" />
        <span className="w-6 bg-blue-500/70 h-[55%]" />
      </div>
    </div>
  );
}

function SunriseGradient({ value, label, Icon }: WeatherRotateTemplateProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: "linear-gradient(200deg, #f2a65a, #5c3a8e 60%, #151233)",
        animation: "sunrise-shift 10s ease-in-out infinite alternate",
      }}
    >
      <div className="flex flex-col items-center gap-2 bg-white/15 backdrop-blur-md rounded-2xl px-10 py-6">
        <Icon className="w-12 h-12 text-white" />
        <span className="font-mono text-white text-6xl md:text-7xl tabular-nums">{value}</span>
        <span className="text-white/80 text-lg uppercase tracking-[0.2em]">{label}</span>
      </div>
    </div>
  );
}

function HorizonLine({ value, label, Icon }: WeatherRotateTemplateProps) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{
        background: "linear-gradient(180deg, #3c5a86 0%, #3c5a86 48%, #0e1420 48%, #0e1420 100%)",
      }}
    >
      <Icon className="w-12 h-12 text-white -mt-6" />
      <span className="font-mono text-white text-7xl md:text-8xl tabular-nums -mt-2">{value}</span>
      <span className="text-white/70 text-lg uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

export const WEATHER_ROTATE_TEMPLATES: Record<WeatherRotateTemplateId, ComponentType<WeatherRotateTemplateProps>> = {
  "billboard-spot": BillboardSpot,
  "control-room": ControlRoom,
  "retail-promo": RetailPromo,
  "weather-station-hero": WeatherStationHero,
  "corporate-brief": CorporateBrief,
  "sunrise-gradient": SunriseGradient,
  "horizon-line": HorizonLine,
};
