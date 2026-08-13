"use client";

import { useEffect, useState } from "react";
import {
  ChipStyleId,
  WeatherFullscreenTemplateId,
  WeatherRotateTemplateId,
  WeatherStyleId,
  WeatherTogetherTemplateId,
} from "@/interfaces/Preview";
import { CHIP_STYLES } from "@/components/preview/shared/chipStyles";
import { RotateDots } from "@/components/preview/shared/RotateDots";
import { WEATHER_ONLY_STYLES } from "./styles/registry";
import { WEATHER_ROTATE_TEMPLATES } from "./fullscreen/registry";
import { WEATHER_TOGETHER_TEMPLATES } from "./fullscreen/together";
import { conditionFromCode, weatherIcon } from "@/lib/weather-condition";

interface WeatherLocationConfig {
  id: string;
  label: string;
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  unit?: "C" | "F";
}

interface WeatherNotOverlayProps {
  config: {
    style: WeatherStyleId;
    layout: "vertical" | "horizontal" | "rotate";
    fullscreenStyle?: WeatherFullscreenTemplateId;
    locations: WeatherLocationConfig[];
  };
}

interface WeatherData {
  temperature: number | null;
  unit: "C" | "F";
  weathercode: number | null;
  isDay: boolean;
}

export function WeatherNotOverlay({ config }: WeatherNotOverlayProps) {
  const [data, setData] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  /* ================= FETCH WEATHER ================= */
  const fetchWeather = async () => {
    try {
      const results = await Promise.all(
        config.locations.map(async (loc) => {
          const { lat, lon } = loc.location;

          const res = await fetch(`/api/player/weather?lat=${lat}&lon=${lon}`);

          if (!res.ok) {
            return [
              loc.id,
              { temperature: null, unit: "C" as const, weathercode: null, isDay: true },
            ] as const;
          }

          const json = await res.json();

          return [
            loc.id,
            {
              temperature: json.temperature,
              unit: json.unit ?? "C",
              weathercode: json.weathercode ?? null,
              isDay: json.isDay ?? true,
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

  /* revezamento — só quando layout === "rotate" */
  useEffect(() => {
    if (config.layout !== "rotate" || !config.locations?.length) return;

    const rotate = setInterval(() => {
      setIndex((i) => (i + 1) % config.locations.length);
    }, 6000);

    return () => clearInterval(rotate);
  }, [config.layout, config.locations]);

  if (!config.locations?.length) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm">
        Nenhuma localização configurada
      </div>
    );
  }

  const containerClass =
    config.layout === "horizontal" ? "flex items-center gap-12" : "flex flex-col gap-8";

  /* ================= RENDER TEMP ================= */
  const renderTemp = (loc: WeatherLocationConfig) => {
    const weather = data[loc.id];
    const temp = weather?.temperature ?? null;
    const unit = weather?.unit ?? "C";
    const value = temp !== null ? `${Math.round(temp)}°${unit}` : "--";
    const celsius = temp == null ? null : unit === "F" ? ((temp - 32) * 5) / 9 : temp;
    const condition = conditionFromCode(weather?.weathercode);
    const Icon = weatherIcon(condition, weather?.isDay ?? true);

    const OnlyStyle = WEATHER_ONLY_STYLES[config.style];
    if (OnlyStyle) {
      return <OnlyStyle value={value} celsius={celsius} size="lg" />;
    }

    const Chip = CHIP_STYLES[config.style as ChipStyleId] ?? CHIP_STYLES.minimal;
    return (
      <Chip
        value={value}
        label={loc.label}
        icon={Icon}
        size="lg"
        sphere={{ geometry: "torus", color: 0x0ea5e9 }}
      />
    );
  };

  if (config.layout === "rotate") {
    const loc = config.locations[index];
    const Template = config.fullscreenStyle
      ? WEATHER_ROTATE_TEMPLATES[config.fullscreenStyle as WeatherRotateTemplateId]
      : undefined;

    if (Template && !loading) {
      const weather = data[loc.id];
      const temp = weather?.temperature ?? null;
      const unit = weather?.unit ?? "C";
      const value = temp !== null ? `${Math.round(temp)}°${unit}` : "--";
      const condition = conditionFromCode(weather?.weathercode);
      const Icon = weatherIcon(condition, weather?.isDay ?? true);

      return (
        <div key={loc.id} className="relative w-full h-full animate-[time-fade_0.5s_ease-out]">
          <Template value={value} label={loc.label} Icon={Icon} />
          <RotateDots
            count={config.locations.length}
            index={index}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div key={loc.id} className="flex flex-col items-center gap-3 animate-[time-fade_0.5s_ease-out]">
          <span className="text-4xl uppercase tracking-wide text-gray-400">{loc.label}</span>
          {loading ? <div className="text-4xl text-gray-500">--</div> : renderTemp(loc)}
          <RotateDots count={config.locations.length} index={index} className="mt-2" />
        </div>
      </div>
    );
  }

  const TogetherTemplate = config.fullscreenStyle
    ? WEATHER_TOGETHER_TEMPLATES[config.fullscreenStyle as WeatherTogetherTemplateId]
    : undefined;

  if (TogetherTemplate && !loading) {
    const locations = config.locations.map((loc) => {
      const weather = data[loc.id];
      const temp = weather?.temperature ?? null;
      const unit = weather?.unit ?? "C";
      const value = temp !== null ? `${Math.round(temp)}°${unit}` : "--";
      const condition = conditionFromCode(weather?.weathercode);

      return {
        value,
        label: loc.label,
        Icon: weatherIcon(condition, weather?.isDay ?? true),
      };
    });

    return (
      <div className="w-full h-full">
        <TogetherTemplate locations={locations} />
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className={containerClass}>
        {config.locations.map((loc) => (
          <div key={loc.id} className="flex flex-col items-center gap-3">
            <span className="text-4xl uppercase tracking-wide text-gray-400">{loc.label}</span>
            {loading ? <div className="text-4xl text-gray-500">--</div> : renderTemp(loc)}
          </div>
        ))}
      </div>
    </div>
  );
}
