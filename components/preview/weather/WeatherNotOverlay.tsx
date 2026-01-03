"use client";

import { useEffect, useState } from "react";
import { Thermometer } from "lucide-react";

interface WeatherNotOverlayProps {
  config: {
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
      | "dark";
    layout: "vertical" | "horizontal";
    locations: {
      id: string;
      label: string;
      location: {
        name: string;
        country: string;
        lat: number;
        lon: number;
      };
      unit?: "C" | "F";
    }[];
  };
}

interface WeatherData {
  temperature: number | null;
  unit: "C" | "F";
}

export function WeatherNotOverlay({ config }: WeatherNotOverlayProps) {
  const [data, setData] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState(true);

  /* ================= FETCH WEATHER ================= */
  const fetchWeather = async () => {
    try {
      const results = await Promise.all(
        config.locations.map(async (loc) => {
          const { lat, lon } = loc.location;

          const res = await fetch(`/api/player/weather?lat=${lat}&lon=${lon}`);

          if (!res.ok) {
            return [loc.id, { temperature: null, unit: "C" }] as const;
          }

          const json = await res.json();

          return [
            loc.id,
            {
              temperature: json.temperature,
              unit: json.unit ?? "C",
            },
          ] as const;
        })
      );

      setData(Object.fromEntries(results));
    } catch (error) {
      console.error("Erro ao buscar temperatura", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!config.locations?.length) return;

    const timeout = setTimeout(fetchWeather, 0);
    const interval = setInterval(fetchWeather, 300_000); // 5 minutos

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [config.locations]);

  if (!config.locations?.length) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm">
        Nenhuma localização configurada
      </div>
    );
  }

  const containerClass =
    config.layout === "horizontal"
      ? "flex items-center gap-12"
      : "flex flex-col gap-8";

  /* ================= RENDER TEMP ================= */
  const renderTemp = (temp: number | null, unit = "C") => {
    const value = temp !== null ? `${Math.round(temp)}°${unit}` : "--";

    switch (config.style) {
      case "badge":
        return (
          <div className="px-6 py-3 bg-white text-gray-800 text-6xl font-medium rounded-full shadow">
            {value}
          </div>
        );

      case "card":
        return (
          <div className="flex items-center gap-3 bg-white text-gray-800 text-6xl px-6 py-4 rounded-xl shadow">
            <Thermometer className="w-10 h-10" />
            <span className="font-semibold">{value}</span>
          </div>
        );

      case "digital":
        return (
          <div className="px-6 py-4 bg-black text-green-400 font-mono text-6xl tracking-widest rounded-xl shadow-inner">
            {value}
          </div>
        );

      case "glass":
        return (
          <div className="backdrop-blur-md bg-white/20 border border-white/30 px-8 py-4 rounded-3xl shadow-xl text-white text-6xl font-semibold">
            {value}
          </div>
        );

      case "pulse":
        return (
          <div className="text-white text-6xl font-bold animate-pulse">
            {value}
          </div>
        );

      case "neon":
        return (
          <div className="text-cyan-400 text-6xl font-bold shadow-[0_0_18px_#22d3ee]">
            {value}
          </div>
        );

      case "corporate":
        return (
          <div className="bg-white border border-gray-300 px-8 py-4 rounded-xl text-gray-800 text-6xl font-semibold shadow">
            {value}
          </div>
        );

      case "tech":
        return (
          <div className="bg-slate-900 border border-slate-700 px-8 py-4 rounded-xl text-cyan-400 text-6xl font-mono shadow">
            {value}
          </div>
        );

      case "dark":
        return (
          <div className="bg-gradient-to-br from-black to-gray-900 px-8 py-4 rounded-xl text-white text-6xl font-semibold shadow-lg">
            {value}
          </div>
        );

      default:
        return <div className="text-6xl font-semibold text-white">{value}</div>;
    }
  };

  /* ================= UI ================= */
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className={containerClass}>
        {config.locations.map((loc) => (
          <div key={loc.id} className="flex flex-col items-center gap-3">
            <span className="text-4xl uppercase tracking-wide text-gray-400">
              {loc.label}
            </span>

            {loading ? (
              <div className="text-4xl text-gray-500">--</div>
            ) : (
              renderTemp(data[loc.id]?.temperature ?? null, data[loc.id]?.unit)
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
