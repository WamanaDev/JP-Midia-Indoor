"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { ClockConfig } from "@/interfaces/Preview";

const DEFAULT_CLOCK_LABEL = "Novo local";

function displayLabel(clock: ClockConfig) {
  return clock.label && clock.label !== DEFAULT_CLOCK_LABEL
    ? clock.label
    : clock.location?.name ?? clock.label;
}

interface TimeNotOverlayProps {
  config: {
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
      | "analog-dark";
    layout: "vertical" | "horizontal";
    clocks: ClockConfig[];
  };
}

export function TimeNotOverlay({ config }: TimeNotOverlayProps) {
  const [now, setNow] = useState(new Date());
  const [minuteKey, setMinuteKey] = useState(0);
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

  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);

      // força recriação do elemento a cada minuto
      if (current.getSeconds() === 0) {
        setMinuteKey((k) => k + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const containerClass =
    config.layout === "horizontal"
      ? "flex items-center gap-10"
      : "flex flex-col gap-8";

  const renderTime = (clock: ClockConfig) => {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: clock.location?.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: clock.format === "12h",
    });

    const time = formatter.format(now);

    switch (config.style) {
      case "badge":
        return (
          <div
            key={minuteKey}
            className="px-6 py-3 bg-white text-gray-800 text-6xl font-medium rounded-full shadow animate-[time-fade_0.5s_ease-out]"
          >
            {time}
          </div>
        );

      case "card":
        return (
          <div
            key={minuteKey}
            className="flex items-center gap-3 bg-white text-gray-800 text-6xl px-6 py-4 rounded-xl shadow animate-[time-fade_0.5s_ease-out]"
          >
            <Clock className="w-10 h-10" />
            <span className="font-semibold">{time}</span>
          </div>
        );

      case "digital":
        return (
          <div
            key={minuteKey}
            className="px-6 py-4 bg-black text-green-400 font-mono text-6xl tracking-widest rounded-xl shadow-inner animate-[time-fade_0.5s_ease-out]"
          >
            {time}
          </div>
        );

      case "glass":
        return (
          <div
            key={minuteKey}
            className="backdrop-blur-md bg-white/20 border border-white/30 px-8 py-4 rounded-3xl shadow-xl text-white text-6xl font-semibold animate-[time-fade_0.5s_ease-out]"
          >
            {time}
          </div>
        );

      case "flip":
        return (
          <div
            key={minuteKey}
            className="bg-black rounded-2xl shadow-xl px-8 py-4 text-white font-mono text-6xl animate-[time-flip_0.6s_ease-out]"
          >
            {time}
          </div>
        );

      case "pulse":
        return (
          <div
            key={minuteKey}
            className="text-white text-6xl font-bold animate-[time-pulse_0.6s_ease-out]"
          >
            {time}
          </div>
        );

      case "analog-minimal": {
        const { hours, minutes, seconds } = getTimeParts(
          now,
          clock.location?.timezone
        );

        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minuteDeg = minutes * 6 + seconds * 0.1;

        return (
          <div className="w-40 h-40 rounded-full border-4 border-white relative">
            {/* ponteiro hora */}
            <div
              className="absolute w-1 h-12 bg-white top-8 left-1/2 origin-bottom transition-transform duration-500"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />

            {/* ponteiro minuto */}
            <div
              className="absolute w-1 h-16 bg-white top-4 left-1/2 origin-bottom transition-transform duration-300"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />

            {/* centro */}
            <div className="absolute w-3 h-3 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
      }

      case "analog-neon": {
        const { hours, minutes, seconds } = getTimeParts(
          now,
          clock.location?.timezone
        );

        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minuteDeg = minutes * 6 + seconds * 0.1;

        return (
          <div className="w-40 h-40 rounded-full bg-black border border-cyan-400 relative shadow-[0_0_25px_#22d3ee]">
            {/* aro interno */}
            <div className="absolute inset-2 rounded-full border border-cyan-400/30" />

            {/* hora */}
            <div
              className="absolute w-1.5 h-12 bg-cyan-400 top-8 left-1/2 origin-bottom shadow-[0_0_10px_#22d3ee] transition-transform duration-500"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />

            {/* minuto */}
            <div
              className="absolute w-1 h-16 bg-cyan-300 top-4 left-1/2 origin-bottom shadow-[0_0_14px_#67e8f9] transition-transform duration-300"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />

            {/* centro */}
            <div className="absolute w-3 h-3 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_#22d3ee]" />
          </div>
        );
      }

      case "analog-neon": {
        const { hours, minutes, seconds } = getTimeParts(
          now,
          clock.location?.timezone
        );

        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minuteDeg = minutes * 6 + seconds * 0.1;

        return (
          <div className="w-40 h-40 rounded-full bg-black border border-cyan-400 relative shadow-[0_0_25px_#22d3ee]">
            {/* aro interno */}
            <div className="absolute inset-2 rounded-full border border-cyan-400/30" />

            {/* hora */}
            <div
              className="absolute w-1.5 h-12 bg-cyan-400 top-8 left-1/2 origin-bottom shadow-[0_0_10px_#22d3ee] transition-transform duration-500"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />

            {/* minuto */}
            <div
              className="absolute w-1 h-16 bg-cyan-300 top-4 left-1/2 origin-bottom shadow-[0_0_14px_#67e8f9] transition-transform duration-300"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />

            {/* centro */}
            <div className="absolute w-3 h-3 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_#22d3ee]" />
          </div>
        );
      }
      case "analog-corporate": {
        const { hours, minutes, seconds } = getTimeParts(
          now,
          clock.location?.timezone
        );

        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minuteDeg = minutes * 6 + seconds * 0.1;

        return (
          <div className="w-44 h-44 rounded-full bg-white border border-gray-300 relative shadow-lg">
            {/* marcações */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-3 bg-gray-400 top-1 left-1/2 origin-bottom"
                style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
              />
            ))}

            {/* hora */}
            <div
              className="absolute w-1.5 h-14 bg-gray-700 top-8 left-1/2 origin-bottom transition-transform duration-500"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />

            {/* minuto */}
            <div
              className="absolute w-1 h-18 bg-gray-500 top-4 left-1/2 origin-bottom transition-transform duration-300"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />

            {/* centro */}
            <div className="absolute w-2.5 h-2.5 bg-gray-700 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
      }
      case "analog-tech": {
        const { hours, minutes, seconds } = getTimeParts(
          now,
          clock.location?.timezone
        );

        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minuteDeg = minutes * 6 + seconds * 0.1;

        return (
          <div className="w-44 h-44 rounded-full bg-slate-900 border border-slate-700 relative shadow-2xl">
            {/* grid circular */}
            <div className="absolute inset-3 rounded-full border border-slate-700/50" />

            {/* ticks */}
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className={`absolute top-1 left-1/2 origin-bottom ${
                  i % 5 === 0
                    ? "h-3 w-0.5 bg-cyan-400"
                    : "h-2 w-px bg-slate-600"
                }`}
                style={{ transform: `translateX(-50%) rotate(${i * 6}deg)` }}
              />
            ))}

            {/* hora */}
            <div
              className="absolute w-1.5 h-14 bg-cyan-400 top-8 left-1/2 origin-bottom shadow-[0_0_10px_#22d3ee] transition-transform duration-500"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />

            {/* minuto */}
            <div
              className="absolute w-1 h-18 bg-cyan-300 top-4 left-1/2 origin-bottom shadow-[0_0_14px_#67e8f9] transition-transform duration-300"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />

            {/* centro */}
            <div className="absolute w-3 h-3 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_#22d3ee]" />
          </div>
        );
      }
      case "analog-dark": {
        const { hours, minutes, seconds } = getTimeParts(
          now,
          clock.location?.timezone
        );

        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minuteDeg = minutes * 6 + seconds * 0.1;

        return (
          <div className="w-44 h-44 rounded-full bg-gradient-to-br from-black to-gray-900 border border-gray-700 relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            {/* aro */}
            <div className="absolute inset-2 rounded-full border border-gray-600/40" />

            {/* marcações */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-3 bg-gray-400 top-1 left-1/2 origin-bottom"
                style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
              />
            ))}

            {/* hora */}
            <div
              className="absolute w-1.5 h-14 bg-white top-8 left-1/2 origin-bottom transition-transform duration-500"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />

            {/* minuto */}
            <div
              className="absolute w-1 h-18 bg-gray-300 top-4 left-1/2 origin-bottom transition-transform duration-300"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />

            {/* centro */}
            <div className="absolute w-2.5 h-2.5 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
      }

      default:
        return (
          <div
            key={minuteKey}
            className="text-6xl font-semibold text-white animate-[time-fade_0.5s_ease-out]"
          >
            {time}
          </div>
        );
    }
  };

  if (!config.clocks?.length) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm">
        Nenhum relógio configurado
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className={containerClass}>
        {config.clocks.map((clock) => (
          <div key={clock.id} className="flex flex-col items-center gap-3">
            <span className="text-4xl uppercase tracking-wide text-gray-400">
              {displayLabel(clock)}
            </span>

            {renderTime(clock)}
          </div>
        ))}
      </div>
    </div>
  );
}
