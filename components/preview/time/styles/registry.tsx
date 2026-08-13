"use client";

import type { ComponentType } from "react";
import type { TimeStyleId } from "@/interfaces/Preview";
import { AnalogClock } from "./AnalogClock";
import { FlipDigitClock } from "./FlipDigitClock";

export interface TimeOnlyStyleProps {
  time: string;
  size?: "sm" | "lg";
  hourDeg: number;
  minuteDeg: number;
}

function Flip({ time, size = "sm" }: TimeOnlyStyleProps) {
  return (
    <div
      className={`bg-black text-white font-mono shadow-xl animate-[time-flip_0.6s_ease-out] ${
        size === "lg" ? "rounded-2xl px-8 py-4 text-6xl" : "rounded-xl px-6 py-3 text-2xl"
      }`}
    >
      {time}
    </div>
  );
}

function Flip3D({ time, size = "sm" }: TimeOnlyStyleProps) {
  return <FlipDigitClock time={time} size={size} />;
}

function AnalogMinimal({ hourDeg, minuteDeg, size }: TimeOnlyStyleProps) {
  return <AnalogClock variant="analog-minimal" hourDeg={hourDeg} minuteDeg={minuteDeg} size={size} />;
}

function AnalogNeon({ hourDeg, minuteDeg, size }: TimeOnlyStyleProps) {
  return <AnalogClock variant="analog-neon" hourDeg={hourDeg} minuteDeg={minuteDeg} size={size} />;
}

function AnalogCorporate({ hourDeg, minuteDeg, size }: TimeOnlyStyleProps) {
  return <AnalogClock variant="analog-corporate" hourDeg={hourDeg} minuteDeg={minuteDeg} size={size} />;
}

/** Estilos que só existem pro relógio (fora do catálogo de chip compartilhado). */
export const TIME_ONLY_STYLES: Partial<Record<TimeStyleId, ComponentType<TimeOnlyStyleProps>>> = {
  flip: Flip,
  flip3d: Flip3D,
  "analog-minimal": AnalogMinimal,
  "analog-neon": AnalogNeon,
  "analog-corporate": AnalogCorporate,
};
