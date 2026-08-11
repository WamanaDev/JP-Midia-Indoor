"use client";

import { useEffect, useState } from "react";
import { Thermometer } from "lucide-react";
import { GaugeWeather } from "./styles/GaugeWeather";
import { WaveWeather } from "./styles/WaveWeather";
import { ThreeBadge } from "@/components/preview/shared/ThreeBadge";

/* ================= TYPES ================= */

interface WeatherLocation {
  id: string;
  label: string;
  location?: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  unit?: "C" | "F";
}

interface WeatherOverlayProps {
  config: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    style:
      | "minimal"
      | "badge"
      | "card"
      | "digital"
      | "glass"
      | "pulse"
      | "neon"
      | "corporate"
      | "tech"
      | "dark"
      | "gauge"
      | "wave"
      | "sphere";
    locations: WeatherLocation[];
  };
}

interface WeatherData {
  temperature: number | null;
  unit: "C" | "F";
}

/* ================= COMPONENT ================= */

export function WeatherOverlay({ config }: WeatherOverlayProps) {
  const [data, setData] = useState<Record<string, WeatherData>>({});
  const [index, setIndex] = useState(0);

  /* ================= FETCH ================= */

  const fetchWeather = async () => {
    const loc = config.locations[index];
    if (!loc?.location) return;

    const { lat, lon } = loc.location;

    try {
      const res = await fetch(
        `/api/player/weather?lat=${lat}&lon=${lon}&unit=${loc.unit ?? "C"}`
      );

      if (!res.ok) return;

      const json = await res.json();

      setData((prev) => ({
        ...prev,
        [loc.id]: {
          temperature: json.temperature ?? null,
          unit: json.unit ?? "C",
        },
      }));
    } catch (e) {
      console.error("Erro ao buscar weather", e);
    }
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!config.locations?.length) return;

    const timeout = setTimeout(() => {
      fetchWeather();
    }, 0);

    const interval = setInterval(fetchWeather, 300_000); // 5 min

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [config.locations, index]);

  /* ================= ROTATION ================= */

  useEffect(() => {
    if (!config.locations?.length) return;

    const rotate = setInterval(() => {
      setIndex((i) => (i + 1) % config.locations.length);
    }, 6000);

    return () => clearInterval(rotate);
  }, [config.locations]);

  if (!config.locations?.length) return null;

  const location = config.locations[index];
  const weather = data[location.id];

  if (!location.location) return null;

  const positionClass = {
    "top-left": "top-6 left-6 items-start",
    "top-right": "top-6 right-6 items-end",
    "bottom-left": "bottom-6 left-6 items-start",
    "bottom-right": "bottom-6 right-6 items-end",
  }[config.position];

  const value =
    weather?.temperature !== null && weather?.temperature !== undefined
      ? `${Math.round(weather.temperature)}°${weather.unit}`
      : "--";

  const celsius =
    weather?.temperature == null
      ? null
      : weather.unit === "F"
      ? ((weather.temperature - 32) * 5) / 9
      : weather.temperature;

  /* ================= RENDER TEMP ================= */

  const renderTemp = () => {
    switch (config.style) {
      case "badge":
        return (
          <div className="px-4 py-2 bg-white text-gray-800 text-2xl font-medium rounded-full shadow">
            {value}
          </div>
        );

      case "card":
        return (
          <div className="flex items-center gap-2 bg-white text-gray-800 text-2xl px-4 py-2 rounded-lg shadow">
            <Thermometer className="w-4 h-4" />
            <span className="font-semibold">{value}</span>
          </div>
        );

      case "digital":
        return (
          <div className="px-4 py-2 bg-black text-green-400 font-mono text-2xl tracking-widest rounded shadow-inner">
            {value}
          </div>
        );

      case "glass":
        return (
          <div className="backdrop-blur-md bg-white/20 border border-white/30 px-5 py-2 rounded-xl shadow-xl text-white text-2xl font-semibold">
            {value}
          </div>
        );

      case "pulse":
        return (
          <div className="text-white text-2xl font-bold animate-[time-pulse_0.8s_ease-out]">
            {value}
          </div>
        );

      case "neon":
        return (
          <div className="text-cyan-400 text-2xl font-bold shadow-[0_0_12px_#22d3ee]">
            {value}
          </div>
        );

      case "corporate":
        return (
          <div className="bg-white border border-gray-300 px-5 py-2 rounded-lg text-gray-800 text-2xl font-semibold shadow">
            {value}
          </div>
        );

      case "tech":
        return (
          <div className="bg-slate-900 border border-slate-700 px-5 py-2 rounded-lg text-cyan-400 text-2xl font-mono shadow">
            {value}
          </div>
        );

      case "dark":
        return (
          <div className="bg-gradient-to-br from-black to-gray-900 px-5 py-2 rounded-lg text-white text-2xl font-semibold shadow-lg">
            {value}
          </div>
        );

      /* ===== NOVOS (GSAP por valor + Three.js) ===== */

      case "gauge":
        return <GaugeWeather value={value} celsius={celsius} />;

      case "wave":
        return <WaveWeather value={value} />;

      case "sphere":
        return (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <ThreeBadge size={96} geometry="torus" color={0x0ea5e9} />
            </div>
            <span className="relative text-lg font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {value}
            </span>
          </div>
        );

      default:
        return <div className="text-2xl font-semibold text-white">{value}</div>;
    }
  };

  /* ================= UI ================= */

  return (
    <div
      key={location.id}
      className={`absolute z-150 flex flex-col gap-2 ${positionClass}
        animate-[overlay-fade_0.6s_ease-out]`}
    >
      <span className="m-auto text-center text-xs uppercase tracking-wide text-gray-300">
        {location.label}
      </span>

      {renderTemp()}
    </div>
  );
}
