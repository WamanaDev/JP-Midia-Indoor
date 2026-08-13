"use client";

import type { ComponentType } from "react";
import type { WeatherStyleId } from "@/interfaces/Preview";
import { GaugeWeather } from "./GaugeWeather";

export interface WeatherOnlyStyleProps {
  value: string;
  celsius: number | null;
  size?: "sm" | "lg";
}

function Neon({ value, size = "sm" }: WeatherOnlyStyleProps) {
  return (
    <div
      className={`text-cyan-400 font-bold ${
        size === "lg" ? "text-6xl shadow-[0_0_18px_#22d3ee]" : "text-2xl shadow-[0_0_12px_#22d3ee]"
      }`}
    >
      {value}
    </div>
  );
}

function Corporate({ value, size = "sm" }: WeatherOnlyStyleProps) {
  return (
    <div
      className={`bg-white border border-gray-300 text-gray-800 font-semibold shadow ${
        size === "lg" ? "text-6xl px-8 py-4 rounded-xl" : "text-2xl px-5 py-2 rounded-lg"
      }`}
    >
      {value}
    </div>
  );
}

function Tech({ value, size = "sm" }: WeatherOnlyStyleProps) {
  return (
    <div
      className={`bg-slate-900 border border-slate-700 text-cyan-400 font-mono shadow ${
        size === "lg" ? "text-6xl px-8 py-4 rounded-xl" : "text-2xl px-5 py-2 rounded-lg"
      }`}
    >
      {value}
    </div>
  );
}

function Dark({ value, size = "sm" }: WeatherOnlyStyleProps) {
  return (
    <div
      className={`bg-gradient-to-br from-black to-gray-900 text-white font-semibold shadow-lg ${
        size === "lg" ? "text-6xl px-8 py-4 rounded-xl" : "text-2xl px-5 py-2 rounded-lg"
      }`}
    >
      {value}
    </div>
  );
}

function Gauge({ value, celsius, size }: WeatherOnlyStyleProps) {
  return <GaugeWeather value={value} celsius={celsius} size={size} />;
}

/** Estilos que só existem pro clima (fora do catálogo de chip compartilhado). */
export const WEATHER_ONLY_STYLES: Partial<Record<WeatherStyleId, ComponentType<WeatherOnlyStyleProps>>> = {
  neon: Neon,
  corporate: Corporate,
  tech: Tech,
  dark: Dark,
  gauge: Gauge,
};
