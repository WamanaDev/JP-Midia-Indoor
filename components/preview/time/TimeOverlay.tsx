"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { ClockConfig } from "@/interfaces/Preview";
import { OrbitClock } from "./styles/OrbitClock";
import { FlipDigitClock } from "./styles/FlipDigitClock";
import { ThreeBadge } from "@/components/preview/shared/ThreeBadge";

const DEFAULT_CLOCK_LABEL = "Novo local";

interface TimeOverlayProps {
  config: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    style:
      | "minimal"
      | "badge"
      | "card"
      | "digital"
      | "glass"
      | "flip"
      | "pulse"
      | "analog-minimal"
      | "analog-neon"
      | "analog-corporate"
      | "analog-tech"
      | "analog-dark"
      | "orbit"
      | "flip3d"
      | "sphere";
    clocks: ClockConfig[];
  };
}

export function TimeOverlay({ config }: TimeOverlayProps) {
  const [now, setNow] = useState(new Date());
  const [index, setIndex] = useState(0);
  const getTimeParts = (date: Date, timezone: string | undefined) => {
    const parts = new Intl.DateTimeFormat("pt-BR", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    })
      .formatToParts(date)
      .reduce((acc: any, p) => {
        if (p.type !== "literal") acc[p.type] = Number(p.value);
        return acc;
      }, {});

    return {
      hours: parts.hour,
      minutes: parts.minute,
      seconds: parts.second,
    };
  };

  /* relógio */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* rotação */
  useEffect(() => {
    if (!config.clocks?.length) return;

    const rotate = setInterval(() => {
      setIndex((i) => (i + 1) % config.clocks.length);
    }, 6000);

    return () => clearInterval(rotate);
  }, [config.clocks]);

  if (!config.clocks?.length) return null;

  const clock = config.clocks[index];

  const positionClass = {
    "top-left": "top-6 left-6 items-start",
    "top-right": "top-6 right-6 items-end",
    "bottom-left": "bottom-6 left-6 items-start",
    "bottom-right": "bottom-6 right-6 items-end",
  }[config.position];

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: clock.location?.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: clock.format === "12h",
  });

  const time = formatter.format(now);

  const displayLabel =
    clock.label && clock.label !== DEFAULT_CLOCK_LABEL
      ? clock.label
      : clock.location?.name ?? clock.label;

  /* ===================== ANALÓGICOS ===================== */

  const renderAnalog = (variant: string) => {
    const { hours, minutes, seconds } = getTimeParts(
      now,
      clock.location?.timezone
    );
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6 + seconds * 0.1;

    switch (variant) {
      case "analog-minimal":
        return (
          <div className="w-24 h-24 rounded-full border-2 border-white relative">
            <div
              className="absolute w-1 h-7 bg-white top-5 left-1/2 origin-bottom transition-transform"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />
            <div
              className="absolute w-0.5 h-10 bg-white top-3 left-1/2 origin-bottom transition-transform"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />
            <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );

      case "analog-neon":
        return (
          <div className="w-24 h-24 rounded-full bg-black border border-cyan-400 shadow-[0_0_20px_#22d3ee] relative">
            <div
              className="absolute w-1.5 h-7 bg-cyan-400 top-5 left-1/2 origin-bottom shadow-[0_0_8px_#22d3ee]"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />
            <div
              className="absolute w-1 h-10 bg-cyan-300 top-3 left-1/2 origin-bottom shadow-[0_0_12px_#67e8f9]"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />
            <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );

      case "analog-corporate":
        return (
          <div className="w-24 h-24 rounded-full bg-white border border-gray-300 shadow relative">
            <div
              className="absolute w-1.5 h-7 bg-gray-700 top-5 left-1/2 origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />
            <div
              className="absolute w-1 h-10 bg-gray-500 top-3 left-1/2 origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />
            <div className="absolute w-2 h-2 bg-gray-700 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );

      case "analog-tech":
        return (
          <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-700 shadow-xl relative">
            <div
              className="absolute w-1.5 h-7 bg-cyan-400 top-5 left-1/2 origin-bottom shadow-[0_0_8px_#22d3ee]"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />
            <div
              className="absolute w-1 h-10 bg-cyan-300 top-3 left-1/2 origin-bottom shadow-[0_0_12px_#67e8f9]"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />
            <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );

      case "analog-dark":
        return (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-black to-gray-900 border border-gray-700 shadow relative">
            <div
              className="absolute w-1.5 h-7 bg-white top-5 left-1/2 origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />
            <div
              className="absolute w-1 h-10 bg-gray-300 top-3 left-1/2 origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />
            <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
    }
  };

  /* ===================== DIGITAIS ===================== */

  const renderDigital = () => {
    switch (config.style) {
      case "badge":
        return (
          <div className="px-4 py-2 bg-white text-gray-800 text-2xl font-medium rounded-full shadow">
            {time}
          </div>
        );

      case "card":
        return (
          <div className="flex items-center gap-2 bg-white text-gray-800 text-2xl px-4 py-2 rounded-lg shadow">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">{time}</span>
          </div>
        );

      case "digital":
        return (
          <div className="px-4 py-2 bg-black text-green-400 font-mono text-2xl tracking-widest rounded shadow-inner">
            {time}
          </div>
        );

      /* ===== NOVOS ===== */

      case "glass":
        return (
          <div className="backdrop-blur-md bg-white/20 border border-white/30 px-5 py-2 rounded-xl shadow-xl text-white text-2xl font-semibold">
            {time}
          </div>
        );

      case "flip":
        return (
          <div className="bg-black px-6 py-3 rounded-xl shadow-xl text-white font-mono text-2xl animate-[time-flip_0.6s_ease-out]">
            {time}
          </div>
        );

      case "pulse":
        return (
          <div className="text-white text-2xl font-bold animate-[time-pulse_0.8s_ease-out]">
            {time}
          </div>
        );

      /* ===== NOVOS (GSAP por valor + Three.js) ===== */

      case "orbit":
        return <OrbitClock time={time} />;

      case "flip3d":
        return <FlipDigitClock time={time} />;

      case "sphere":
        return (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <ThreeBadge size={96} geometry="icosahedron" />
            </div>
            <span className="relative text-lg font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {time}
            </span>
          </div>
        );

      /* ===== fallback ===== */

      default:
        return <div className="text-2xl font-semibold text-white">{time}</div>;
    }
  };

  return (
    <div
      key={clock.id}
      className={`absolute z-150 flex flex-col gap-2 ${positionClass}
        animate-[overlay-fade_0.6s_ease-out]`}
    >
      <span className="m-auto text-center justify-center text-xs uppercase tracking-wide text-gray-300">
        {displayLabel}
      </span>

      {config.style.startsWith("analog")
        ? renderAnalog(config.style)
        : renderDigital()}
    </div>
  );
}
