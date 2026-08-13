"use client";

import type { ComponentType } from "react";
import type { TimeRotateTemplateId } from "@/interfaces/Preview";

export interface TimeRotateTemplateProps {
  time: string;
  label: string;
}

function AirportSplit({ time, label }: TimeRotateTemplateProps) {
  return (
    <div className="w-full h-full flex">
      <div className="flex-1 bg-neutral-950 flex items-center justify-center">
        <span className="font-mono text-white text-7xl md:text-8xl tabular-nums">{time}</span>
      </div>
      <div className="flex-1 bg-gradient-to-br from-blue-900 to-neutral-950 flex items-center justify-center px-6">
        <span className="text-white/90 text-3xl md:text-4xl uppercase tracking-wide text-center">{label}</span>
      </div>
    </div>
  );
}

function TransitBoard({ time, label }: TimeRotateTemplateProps) {
  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-4">
      <span className="font-mono text-amber-400 text-8xl md:text-9xl tracking-[0.15em] tabular-nums [text-shadow:0_0_18px_rgba(245,166,35,0.6)] animate-[led-flicker_4s_step-end_infinite]">
        {time}
      </span>
      <span className="text-amber-400/70 text-xl uppercase tracking-[0.3em]">{label}</span>
    </div>
  );
}

function BoardingPass({ time, label }: TimeRotateTemplateProps) {
  return (
    <div className="w-full h-full bg-[#f4f2ec] flex items-center justify-center gap-10 px-10">
      <div className="flex flex-col items-center">
        <span className="text-neutral-500 text-sm uppercase tracking-widest mb-2">Hora</span>
        <span className="font-mono text-neutral-900 text-6xl md:text-7xl tabular-nums">{time}</span>
      </div>
      <div className="w-px h-40 border-l-2 border-dashed border-neutral-300" />
      <div className="flex flex-col items-center">
        <span className="text-neutral-500 text-sm uppercase tracking-widest mb-2">Local</span>
        <span className="text-neutral-900 text-3xl font-semibold text-center max-w-xs">{label}</span>
      </div>
    </div>
  );
}

function StadiumScoreboard({ time, label }: TimeRotateTemplateProps) {
  return (
    <div className="w-full h-full bg-[#08090b] border-y-8 border-amber-500 flex flex-col items-center justify-center gap-3">
      <span className="font-mono text-white text-8xl md:text-9xl font-black tracking-wide tabular-nums">
        {time}
      </span>
      <span className="text-amber-400 text-lg uppercase tracking-[0.25em]">{label}</span>
    </div>
  );
}

function SubwayPanel({ time, label }: TimeRotateTemplateProps) {
  return (
    <div className="w-full h-full bg-[#04120c] flex flex-col items-center justify-center gap-3">
      <span className="font-mono text-emerald-400 text-8xl md:text-9xl tabular-nums [text-shadow:0_0_14px_rgba(61,220,132,0.55)]">
        {time}
      </span>
      <span className="text-emerald-400/60 text-lg uppercase tracking-[0.3em]">{label}</span>
    </div>
  );
}

function NeonMarquee({ time, label }: TimeRotateTemplateProps) {
  return (
    <div className="relative w-full h-full bg-[#0a0a0d] flex items-center justify-center">
      <div className="absolute inset-8 rounded-2xl border-2 border-amber-400 shadow-[0_0_18px_#f5a623,inset_0_0_18px_#f5a623]" />
      <div className="relative flex flex-col items-center gap-2 animate-[neon-flicker_4s_step-end_infinite]">
        <span className="font-mono text-white text-7xl md:text-8xl tabular-nums [text-shadow:0_0_10px_#f5a623,0_0_24px_#f5a623]">
          {time}
        </span>
        <span className="text-white/80 text-lg uppercase tracking-[0.25em]">{label}</span>
      </div>
    </div>
  );
}

function TerminalReadout({ time, label }: TimeRotateTemplateProps) {
  return (
    <div className="relative w-full h-full bg-[#020402] flex flex-col items-center justify-center gap-3 overflow-hidden">
      <span
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0px, transparent 1px, transparent 3px)",
        }}
      />
      <span className="relative font-mono text-green-400 text-7xl md:text-8xl tabular-nums">
        {time}
        <span className="animate-[terminal-cursor_1s_step-end_infinite]">_</span>
      </span>
      <span className="relative text-green-400/60 text-lg uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function DataWall({ time, label }: TimeRotateTemplateProps) {
  return (
    <div
      className="w-full h-full bg-[#0a0d13] flex items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "16.6% 25%",
      }}
    >
      <div className="flex flex-col items-center gap-2 bg-amber-500/15 border border-amber-500 rounded-lg px-10 py-6">
        <span className="font-mono text-white text-6xl md:text-7xl tabular-nums">{time}</span>
        <span className="text-amber-300 text-sm uppercase tracking-[0.2em]">{label}</span>
      </div>
    </div>
  );
}

export const TIME_ROTATE_TEMPLATES: Record<TimeRotateTemplateId, ComponentType<TimeRotateTemplateProps>> = {
  "airport-split": AirportSplit,
  "transit-board": TransitBoard,
  "boarding-pass": BoardingPass,
  "stadium-scoreboard": StadiumScoreboard,
  "subway-panel": SubwayPanel,
  "neon-marquee": NeonMarquee,
  "terminal-readout": TerminalReadout,
  "data-wall": DataWall,
};
