"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import {
  ChipStyleId,
  ClockConfig,
  TimeFullscreenTemplateId,
  TimeRotateTemplateId,
  TimeStyleId,
  TimeTogetherTemplateId,
} from "@/interfaces/Preview";
import { CHIP_STYLES } from "@/components/preview/shared/chipStyles";
import { RotateDots } from "@/components/preview/shared/RotateDots";
import { TIME_ONLY_STYLES } from "./styles/registry";
import { TIME_ROTATE_TEMPLATES } from "./fullscreen/registry";
import { TIME_TOGETHER_TEMPLATES } from "./fullscreen/together";

const DEFAULT_CLOCK_LABEL = "Novo local";

function displayLabel(clock: ClockConfig) {
  return clock.label && clock.label !== DEFAULT_CLOCK_LABEL
    ? clock.label
    : clock.location?.name ?? clock.label;
}

function getTimeParts(date: Date, timezone: string | undefined) {
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
}

interface TimeNotOverlayProps {
  config: {
    style: TimeStyleId;
    layout: "vertical" | "horizontal" | "rotate";
    fullscreenStyle?: TimeFullscreenTemplateId;
    clocks: ClockConfig[];
  };
}

export function TimeNotOverlay({ config }: TimeNotOverlayProps) {
  const [now, setNow] = useState(new Date());
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* revezamento — só quando layout === "rotate" (mesma cadência do overlay) */
  useEffect(() => {
    if (config.layout !== "rotate" || !config.clocks?.length) return;

    const rotate = setInterval(() => {
      setIndex((i) => (i + 1) % config.clocks.length);
    }, 6000);

    return () => clearInterval(rotate);
  }, [config.layout, config.clocks]);

  if (!config.clocks?.length) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm">
        Nenhum relógio configurado
      </div>
    );
  }

  const containerClass =
    config.layout === "horizontal" ? "flex items-center gap-10" : "flex flex-col gap-8";

  const renderClock = (clock: ClockConfig) => {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: clock.location?.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: clock.format === "12h",
    });

    const time = formatter.format(now);
    const { hours, minutes, seconds } = getTimeParts(now, clock.location?.timezone);
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6 + seconds * 0.1;
    const dayIcon = hours >= 6 && hours < 18 ? Sun : Moon;

    const OnlyStyle = TIME_ONLY_STYLES[config.style];
    if (OnlyStyle) {
      return <OnlyStyle time={time} size="lg" hourDeg={hourDeg} minuteDeg={minuteDeg} />;
    }

    const Chip = CHIP_STYLES[config.style as ChipStyleId] ?? CHIP_STYLES.minimal;
    return <Chip value={time} label={displayLabel(clock)} icon={dayIcon} size="lg" />;
  };

  if (config.layout === "rotate") {
    const clock = config.clocks[index];
    const Template = config.fullscreenStyle
      ? TIME_ROTATE_TEMPLATES[config.fullscreenStyle as TimeRotateTemplateId]
      : undefined;

    if (Template) {
      const formatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: clock.location?.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: clock.format === "12h",
      });

      return (
        <div key={clock.id} className="relative w-full h-full animate-[time-fade_0.5s_ease-out]">
          <Template time={formatter.format(now)} label={displayLabel(clock)} />
          <RotateDots
            count={config.clocks.length}
            index={index}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div key={clock.id} className="flex flex-col items-center gap-3 animate-[time-fade_0.5s_ease-out]">
          <span className="text-4xl uppercase tracking-wide text-gray-400">
            {displayLabel(clock)}
          </span>
          {renderClock(clock)}
          <RotateDots count={config.clocks.length} index={index} className="mt-2" />
        </div>
      </div>
    );
  }

  const TogetherTemplate = config.fullscreenStyle
    ? TIME_TOGETHER_TEMPLATES[config.fullscreenStyle as TimeTogetherTemplateId]
    : undefined;

  if (TogetherTemplate) {
    const clocks = config.clocks.map((clock) => {
      const formatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: clock.location?.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: clock.format === "12h",
      });
      const { hours, minutes, seconds } = getTimeParts(now, clock.location?.timezone);

      return {
        time: formatter.format(now),
        label: displayLabel(clock),
        hourDeg: (hours % 12) * 30 + minutes * 0.5,
        minuteDeg: minutes * 6 + seconds * 0.1,
      };
    });

    return (
      <div className="w-full h-full">
        <TogetherTemplate clocks={clocks} />
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
            {renderClock(clock)}
          </div>
        ))}
      </div>
    </div>
  );
}
