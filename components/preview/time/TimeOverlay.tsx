"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { ChipStyleId, ClockConfig, TimeStyleId } from "@/interfaces/Preview";
import { CHIP_STYLES } from "@/components/preview/shared/chipStyles";
import { TIME_ONLY_STYLES } from "./styles/registry";

const DEFAULT_CLOCK_LABEL = "Novo local";

interface TimeOverlayProps {
  config: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    style: TimeStyleId;
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
      .reduce((acc: Record<string, number>, p) => {
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

  const { hours, minutes, seconds } = getTimeParts(now, clock.location?.timezone);
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const dayIcon = hours >= 6 && hours < 18 ? Sun : Moon;

  const renderStyle = () => {
    const OnlyStyle = TIME_ONLY_STYLES[config.style];
    if (OnlyStyle) {
      return <OnlyStyle time={time} size="sm" hourDeg={hourDeg} minuteDeg={minuteDeg} />;
    }

    const Chip = CHIP_STYLES[config.style as ChipStyleId] ?? CHIP_STYLES.minimal;
    return <Chip value={time} label={displayLabel} icon={dayIcon} size="sm" />;
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

      {renderStyle()}
    </div>
  );
}
