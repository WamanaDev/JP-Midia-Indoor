"use client";

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import type { ChipStyleId } from "@/interfaces/Preview";
import { ThreeBadge } from "@/components/preview/shared/ThreeBadge";

/**
 * Catálogo de "chip" — usado tanto no overlay (canto da tela, `size="sm"`)
 * quanto no modo tela cheia simples (`size="lg"`, quando não há
 * `fullscreenStyle` escolhido). Compartilhado entre relógio e clima: quem
 * chama decide o ícone (glifo de relógio, condição do tempo real, etc.).
 */
export interface ChipStyleProps {
  value: string;
  label?: string;
  icon?: LucideIcon | null;
  size?: "sm" | "lg";
  /** só usado pelo estilo "sphere" — geometria/cor do badge 3D */
  sphere?: { geometry?: "icosahedron" | "torus"; color?: number; accent?: number };
}

function Minimal({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`font-semibold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] ${
        size === "lg" ? "text-6xl" : "text-2xl"
      }`}
    >
      {value}
    </div>
  );
}

function Badge({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`bg-white text-gray-800 font-medium rounded-full shadow ${
        size === "lg" ? "text-6xl px-6 py-3" : "text-2xl px-4 py-2"
      }`}
    >
      {value}
    </div>
  );
}

function Card({ value, icon: Icon, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`flex items-center bg-white text-gray-800 rounded-xl shadow ${
        size === "lg" ? "gap-3 text-6xl px-6 py-4" : "gap-2 text-2xl px-4 py-2"
      }`}
    >
      {Icon && <Icon className={size === "lg" ? "w-10 h-10" : "w-4 h-4"} />}
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Digital({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`bg-black text-green-400 font-mono tracking-widest rounded shadow-inner ${
        size === "lg" ? "text-6xl px-6 py-4 rounded-xl" : "text-2xl px-4 py-2"
      }`}
    >
      {value}
    </div>
  );
}

function Glass({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`backdrop-blur-md bg-white/20 border border-white/30 shadow-xl text-white font-semibold ${
        size === "lg" ? "text-6xl px-8 py-4 rounded-3xl" : "text-2xl px-5 py-2 rounded-xl"
      }`}
    >
      {value}
    </div>
  );
}

function Pulse({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`text-white font-bold ${
        size === "lg"
          ? "text-6xl animate-[time-pulse_0.6s_ease-out]"
          : "text-2xl animate-[time-pulse_0.8s_ease-out]"
      }`}
    >
      {value}
    </div>
  );
}

function Sphere({ value, size = "sm", sphere }: ChipStyleProps) {
  const badgeSize = size === "lg" ? 180 : 96;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: badgeSize, height: badgeSize }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <ThreeBadge
          size={badgeSize}
          geometry={sphere?.geometry ?? "icosahedron"}
          color={sphere?.color}
          accent={sphere?.accent}
        />
      </div>
      <span
        className={`relative font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] ${
          size === "lg" ? "text-4xl" : "text-lg"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ChipOutline({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`border-white text-white font-semibold rounded-full ${
        size === "lg" ? "border-4 text-6xl px-8 py-4" : "border-2 text-2xl px-4 py-2"
      }`}
    >
      {value}
    </div>
  );
}

function TagTicket({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`relative bg-[#f4f1ea] text-neutral-800 font-mono rounded-md ${
        size === "lg" ? "text-6xl pl-12 pr-8 py-4" : "text-2xl pl-8 pr-4 py-2"
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full ring-1 ring-inset ring-neutral-400 bg-black/5 ${
          size === "lg" ? "left-4 w-4 h-4" : "left-2.5 w-2.5 h-2.5"
        }`}
      />
      {value}
    </div>
  );
}

function MonoConsole({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`relative overflow-hidden bg-black text-amber-400 font-mono rounded border border-amber-900/50 ${
        size === "lg" ? "text-6xl px-8 py-4" : "text-2xl px-4 py-2"
      }`}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0px, transparent 1px, transparent 3px)",
        }}
      />
      <span className="relative">{value}</span>
    </div>
  );
}

function NeonBreathe({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`rounded-full border-violet-400 text-violet-100 font-semibold animate-[chip-breathe_2.4s_ease-in-out_infinite] ${
        size === "lg" ? "border-4 text-6xl px-8 py-4" : "border-2 text-2xl px-4 py-2"
      }`}
    >
      {value}
    </div>
  );
}

function BrandStrip({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`bg-emerald-400 text-emerald-950 font-bold rounded ${
        size === "lg" ? "text-6xl px-8 py-4" : "text-2xl px-4 py-2"
      }`}
    >
      {value}
    </div>
  );
}

function PaperTag({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`relative bg-[#f4f2ec] text-neutral-800 shadow-lg ${
        size === "lg" ? "text-6xl px-8 py-4 rounded-sm" : "text-2xl px-4 py-2 rounded-sm"
      }`}
    >
      <span
        className={`absolute top-0 right-0 border-t-transparent border-r-[#d8d3c4] ${
          size === "lg"
            ? "border-l-[16px] border-l-transparent border-b-[16px] border-b-[#d8d3c4]"
            : "border-l-[10px] border-l-transparent border-b-[10px] border-b-[#d8d3c4]"
        }`}
        style={{ width: 0, height: 0 }}
      />
      {value}
    </div>
  );
}

function LedStrip({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`bg-black text-amber-400 font-mono border-b-2 border-dashed border-amber-500/50 ${
        size === "lg" ? "text-6xl px-8 py-4 tracking-[0.3em]" : "text-2xl px-4 py-2 tracking-[0.25em]"
      }`}
    >
      {value}
    </div>
  );
}

function RibbonCorner({ value, size = "sm" }: ChipStyleProps) {
  return (
    <div className={size === "lg" ? "-skew-x-12 bg-amber-500 shadow-lg" : "-skew-x-12 bg-amber-500 shadow"}>
      <span
        className={`inline-block skew-x-12 font-bold text-amber-950 ${
          size === "lg" ? "text-5xl px-8 py-3" : "text-xl px-5 py-1.5"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ViewfinderCorners({ value, size = "sm" }: ChipStyleProps) {
  const mark = size === "lg" ? "w-6 h-6 border-4" : "w-3 h-3 border-2";
  return (
    <div className={`relative text-white font-semibold ${size === "lg" ? "text-6xl px-8 py-4" : "text-2xl px-4 py-2"}`}>
      <span className={`absolute -top-1 -left-1 border-cyan-300 border-r-0 border-b-0 ${mark}`} />
      <span className={`absolute -bottom-1 -right-1 border-cyan-300 border-l-0 border-t-0 ${mark}`} />
      {value}
    </div>
  );
}

function IconTight({ value, icon: Icon, size = "sm" }: ChipStyleProps) {
  return (
    <div
      className={`flex items-center bg-black/60 text-white font-semibold rounded-full ${
        size === "lg" ? "gap-3 text-4xl px-6 py-3" : "gap-1.5 text-xl px-3 py-1.5"
      }`}
    >
      {Icon && <Icon className={size === "lg" ? "w-8 h-8" : "w-4 h-4"} />}
      {value}
    </div>
  );
}

export const CHIP_STYLES: Record<ChipStyleId, ComponentType<ChipStyleProps>> = {
  minimal: Minimal,
  badge: Badge,
  card: Card,
  digital: Digital,
  glass: Glass,
  pulse: Pulse,
  sphere: Sphere,
  "chip-outline": ChipOutline,
  "tag-ticket": TagTicket,
  "mono-console": MonoConsole,
  "neon-breathe": NeonBreathe,
  "brand-strip": BrandStrip,
  "paper-tag": PaperTag,
  "led-strip": LedStrip,
  "ribbon-corner": RibbonCorner,
  "viewfinder-corners": ViewfinderCorners,
  "icon-tight": IconTight,
};
