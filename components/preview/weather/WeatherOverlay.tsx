"use client";

import { useEffect, useState } from "react";
import { ChipStyleId, WeatherStyleId } from "@/interfaces/Preview";
import { CHIP_STYLES } from "@/components/preview/shared/chipStyles";
import { WEATHER_ONLY_STYLES } from "./styles/registry";
import { conditionFromCode, weatherIcon } from "@/lib/weather-condition";

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
    style: WeatherStyleId;
    locations: WeatherLocation[];
  };
}

interface WeatherData {
  temperature: number | null;
  unit: "C" | "F";
  weathercode: number | null;
  isDay: boolean;
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
          weathercode: json.weathercode ?? null,
          isDay: json.isDay ?? true,
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

  const condition = conditionFromCode(weather?.weathercode);
  const Icon = weatherIcon(condition, weather?.isDay ?? true);

  /* ================= RENDER TEMP ================= */

  const renderTemp = () => {
    const OnlyStyle = WEATHER_ONLY_STYLES[config.style];
    if (OnlyStyle) {
      return <OnlyStyle value={value} celsius={celsius} size="sm" />;
    }

    const Chip = CHIP_STYLES[config.style as ChipStyleId] ?? CHIP_STYLES.minimal;
    return (
      <Chip
        value={value}
        label={location.label}
        icon={Icon}
        size="sm"
        sphere={{ geometry: "torus", color: 0x0ea5e9 }}
      />
    );
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
