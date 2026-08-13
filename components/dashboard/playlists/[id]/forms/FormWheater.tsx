"use client";

import { MediaFormProps } from "@/interfaces/Medias";
import { Thermometer } from "lucide-react";
import { WeatherLocation } from "@/interfaces/Preview";
import { useMemo } from "react";
import { OverlayToggle } from "./shared/OverlayToggle";
import { PositionPicker, OverlayPosition } from "./shared/PositionPicker";
import { StylePicker, StyleOption } from "./shared/StylePicker";
import { LayoutPicker, ItemLayout } from "./shared/LayoutPicker";
import { LocationEntryCard } from "./shared/LocationEntryCard";
import { Plus } from "lucide-react";

/* ================= CONSTANTES ================= */

const STYLES: StyleOption[] = [
  {
    id: "minimal",
    label: "Minimalista",
    preview: <div className="text-xl font-semibold text-white">26°C</div>,
  },
  {
    id: "badge",
    label: "Badge",
    preview: (
      <div className="px-3 py-1 bg-white text-gray-800 text-sm font-medium rounded-full shadow">
        26°C
      </div>
    ),
  },
  {
    id: "card",
    label: "Cartão",
    preview: (
      <div className="flex items-center gap-2 bg-white text-gray-800 px-3 py-2 rounded-lg shadow">
        <Thermometer className="w-4 h-4" />
        <span className="font-semibold">26°C</span>
      </div>
    ),
  },
  {
    id: "digital",
    label: "Digital",
    preview: (
      <div className="px-3 py-2 bg-black text-green-400 font-mono text-lg tracking-widest rounded shadow-inner">
        26°C
      </div>
    ),
  },
  {
    id: "glass",
    label: "Glass",
    preview: (
      <div className="backdrop-blur-md bg-white/20 border border-white/30 px-4 py-2 rounded-2xl shadow-xl">
        <span className="text-white text-lg font-semibold">26°C</span>
      </div>
    ),
  },
  {
    id: "pulse",
    label: "Pulse",
    preview: (
      <div className="text-white text-xl font-bold animate-pulse">26°C</div>
    ),
  },
  {
    id: "sphere",
    label: "Esfera 3D",
    preview: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute w-14 h-14 rounded-full bg-linear-to-br from-sky-400 to-blue-700 opacity-70" />
        <span className="relative text-sm font-semibold text-white drop-shadow">
          26°C
        </span>
      </div>
    ),
  },
  {
    id: "neon",
    label: "Neon",
    preview: (
      <div className="text-cyan-400 text-xl font-bold shadow-[0_0_12px_#22d3ee]">
        26°C
      </div>
    ),
  },
  {
    id: "corporate",
    label: "Corporate",
    preview: (
      <div className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-800 font-semibold shadow">
        26°C
      </div>
    ),
  },
  {
    id: "tech",
    label: "Tech",
    preview: (
      <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-cyan-400 font-mono shadow">
        26°C
      </div>
    ),
  },
  {
    id: "dark",
    label: "Dark",
    preview: (
      <div className="bg-gradient-to-br from-black to-gray-900 px-4 py-2 rounded-lg text-white font-semibold shadow-lg">
        26°C
      </div>
    ),
  },
  {
    id: "gauge",
    label: "Medidor",
    preview: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width={64} height={64} viewBox="0 0 64 64" className="-rotate-90">
          <circle
            cx={32}
            cy={32}
            r={24}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={5}
          />
          <circle
            cx={32}
            cy={32}
            r={24}
            fill="none"
            stroke="#facc15"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={2 * Math.PI * 24 * 0.35}
          />
        </svg>
        <span className="absolute text-sm font-semibold text-white">26°C</span>
      </div>
    ),
  },
  {
    id: "chip-outline",
    label: "Contorno",
    preview: (
      <div className="border-2 border-white text-white text-lg font-semibold rounded-full px-4 py-1">
        26°C
      </div>
    ),
  },
  {
    id: "tag-ticket",
    label: "Etiqueta",
    preview: (
      <div className="relative bg-[#f4f1ea] text-neutral-800 font-mono text-lg rounded-md pl-6 pr-3 py-1">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ring-1 ring-inset ring-neutral-400 bg-black/5" />
        26°C
      </div>
    ),
  },
  {
    id: "mono-console",
    label: "Console",
    preview: (
      <div className="bg-black text-amber-400 font-mono text-lg px-3 py-1 rounded border border-amber-900/50">
        26°C
      </div>
    ),
  },
  {
    id: "neon-breathe",
    label: "Neon Respirando",
    preview: (
      <div className="border-2 border-violet-400 text-violet-100 text-lg font-semibold rounded-full px-4 py-1">
        26°C
      </div>
    ),
  },
  {
    id: "brand-strip",
    label: "Faixa de Marca",
    preview: (
      <div className="bg-emerald-400 text-emerald-950 font-bold text-lg px-3 py-1 rounded">
        26°C
      </div>
    ),
  },
  {
    id: "paper-tag",
    label: "Etiqueta de Papel",
    preview: (
      <div className="bg-[#f4f2ec] text-neutral-800 text-lg px-3 py-1 rounded-sm shadow">
        26°C
      </div>
    ),
  },
  {
    id: "led-strip",
    label: "Fita de LED",
    preview: (
      <div className="bg-black text-amber-400 font-mono text-lg tracking-[0.25em] px-3 py-1 border-b-2 border-dashed border-amber-500/50">
        26°C
      </div>
    ),
  },
  {
    id: "ribbon-corner",
    label: "Fita de Canto",
    preview: (
      <div className="-skew-x-12 bg-amber-500">
        <span className="inline-block skew-x-12 text-amber-950 font-bold text-lg px-4 py-1">
          26°C
        </span>
      </div>
    ),
  },
  {
    id: "viewfinder-corners",
    label: "Mira de Câmera",
    preview: (
      <div className="relative text-white font-semibold text-lg px-4 py-1">
        <span className="absolute -top-1 -left-1 w-3 h-3 border-2 border-cyan-300 border-r-0 border-b-0" />
        <span className="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-cyan-300 border-l-0 border-t-0" />
        26°C
      </div>
    ),
  },
  {
    id: "icon-tight",
    label: "Ícone + Clima",
    preview: (
      <div className="flex items-center gap-1.5 bg-black/60 text-white text-base font-semibold rounded-full px-3 py-1">
        <Thermometer className="w-4 h-4" />
        26°C
      </div>
    ),
  },
];

const FULLSCREEN_TEMPLATES: StyleOption[] = [
  {
    id: "",
    label: "Nenhum (chip simples)",
    preview: <div className="text-white text-sm font-semibold">26°C</div>,
  },
  {
    id: "billboard-spot",
    label: "Spot de Luz",
    preview: (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "radial-gradient(circle,#2d4a86,#0a0d16)" }}
      >
        <span className="text-white font-mono text-base">26°</span>
      </div>
    ),
  },
  {
    id: "control-room",
    label: "Sala de Controle",
    preview: (
      <div className="w-full h-full bg-[#0a0f16] flex items-center justify-center">
        <span className="text-teal-300 font-mono text-sm">26°</span>
      </div>
    ),
  },
  {
    id: "retail-promo",
    label: "Promo de Loja",
    preview: (
      <div className="w-full h-full bg-amber-500 flex items-center justify-center">
        <span className="bg-white rounded-lg px-2 py-1 text-neutral-900 font-mono text-xs">26°</span>
      </div>
    ),
  },
  {
    id: "weather-station-hero",
    label: "Estação do Tempo",
    preview: (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "linear-gradient(200deg,#3c6ea5,#16324d)" }}
      >
        <span className="text-white font-mono text-sm">26°</span>
      </div>
    ),
  },
  {
    id: "corporate-brief",
    label: "Slide Corporativo",
    preview: (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <span className="text-neutral-900 font-mono text-sm">26°</span>
      </div>
    ),
  },
  {
    id: "sunrise-gradient",
    label: "Gradiente do Dia",
    preview: (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "linear-gradient(200deg,#f2a65a,#5c3a8e)" }}
      >
        <span className="bg-white/20 rounded px-2 py-1 text-white font-mono text-xs">26°</span>
      </div>
    ),
  },
  {
    id: "horizon-line",
    label: "Linha do Horizonte",
    preview: (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "linear-gradient(180deg,#3c5a86 50%,#0e1420 50%)" }}
      >
        <span className="text-white font-mono text-sm">26°</span>
      </div>
    ),
  },
];

const TOGETHER_TEMPLATES: StyleOption[] = [
  {
    id: "",
    label: "Nenhum (chip repetido)",
    preview: <div className="text-white text-sm font-semibold">26°C</div>,
  },
  {
    id: "grid-mosaic",
    label: "Mosaico",
    preview: (
      <div className="w-full h-full flex">
        <div className="flex-1 bg-[#151a24] flex items-center justify-center text-white text-[9px] font-mono">26°</div>
        <div className="flex-1 bg-[#151a24] border-l border-white/10 flex items-center justify-center text-white text-[9px] font-mono">19°</div>
      </div>
    ),
  },
  {
    id: "dashboard-tiles",
    label: "Tiles de Dashboard",
    preview: (
      <div className="w-full h-full bg-neutral-200 flex items-center justify-center gap-1">
        <span className="bg-white rounded px-2 py-1 text-neutral-900 text-[9px] font-mono shadow">26°</span>
        <span className="bg-white rounded px-2 py-1 text-neutral-900 text-[9px] font-mono shadow">19°</span>
      </div>
    ),
  },
  {
    id: "honeycomb",
    label: "Colmeia",
    preview: (
      <div className="w-full h-full bg-[#0d1119] flex items-center justify-center gap-1">
        <div className="w-8 h-8 bg-[#151d2c] flex items-center justify-center text-white text-[8px] font-mono" style={{ clipPath: "polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)" }}>26°</div>
      </div>
    ),
  },
  {
    id: "weather-strip-multi",
    label: "Faixa do Tempo",
    preview: (
      <div className="w-full h-full flex items-end justify-center gap-2 pb-1" style={{ background: "linear-gradient(180deg,#3c6ea5 50%,#16324d 50%)" }}>
        <span className="text-white text-[9px] font-mono">26°</span>
        <span className="text-white text-[9px] font-mono">19°</span>
      </div>
    ),
  },
  {
    id: "split-duo",
    label: "Split Duplo",
    preview: (
      <div className="w-full h-full flex">
        <div className="flex-1 bg-[#0d1119] border-r border-white/20 flex items-center justify-center text-white text-[9px] font-mono">26°</div>
        <div className="flex-1 bg-[#0d1119] flex items-center justify-center text-white text-[9px] font-mono">19°</div>
      </div>
    ),
  },
  {
    id: "badge-cloud",
    label: "Nuvem de Selos",
    preview: (
      <div className="w-full h-full bg-[#0d1119] flex items-center justify-center gap-1">
        <span className="bg-white/10 border border-white/20 rounded-full px-2 py-1 text-white text-[9px] font-mono">26°</span>
        <span className="bg-white/10 border border-white/20 rounded-full px-2 py-1 text-white text-[9px] font-mono -translate-y-1">19°</span>
      </div>
    ),
  },
  {
    id: "globe-row",
    label: "Fileira de Globos",
    preview: (
      <div className="w-full h-full bg-[#0d1119] flex items-center justify-center gap-2">
        <div className="w-6 h-6 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%,#7fc7f5,#1b4f7a 70%)" }} />
        <div className="w-6 h-6 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%,#7fc7f5,#1b4f7a 70%)" }} />
      </div>
    ),
  },
];

/* ================= FORM ================= */

export function WeatherForm({ value, onChange }: MediaFormProps) {
  const config = useMemo(
    () => ({
      overlay: false,
      position: "",
      style: "minimal",
      layout: "vertical",
      fullscreenStyle: undefined as string | undefined,
      locations: [] as WeatherLocation[],
      ...value.config,
    }),
    [value.config]
  );

  const updateConfig = (partial: Partial<typeof config>) => {
    onChange({
      ...value,
      config: {
        ...config,
        ...partial,
      },
    });
  };

  const updateLocation = (index: number, partial: Partial<WeatherLocation>) => {
    const updated = [...config.locations];
    updated[index] = { ...updated[index], ...partial };
    updateConfig({ locations: updated });
  };

  return (
    <div className="space-y-8">
      <OverlayToggle
        enabled={config.overlay}
        onToggle={() => updateConfig({ overlay: !config.overlay, position: "" })}
      />

      {config.overlay && (
        <PositionPicker
          value={config.position}
          onChange={(position: OverlayPosition) => updateConfig({ position })}
        />
      )}

      {!config.overlay && (
        <LayoutPicker
          value={config.layout}
          onChange={(layout: ItemLayout) => updateConfig({ layout })}
        />
      )}

      <StylePicker
        styles={STYLES}
        value={config.style}
        onChange={(style) => updateConfig({ style })}
      />

      {!config.overlay && config.layout === "rotate" && (
        <StylePicker
          title="Template de tela cheia (opcional)"
          styles={FULLSCREEN_TEMPLATES}
          value={config.fullscreenStyle ?? ""}
          onChange={(fullscreenStyle) => updateConfig({ fullscreenStyle })}
        />
      )}

      {!config.overlay && config.layout !== "rotate" && (
        <StylePicker
          title="Template de tela cheia (opcional)"
          styles={TOGETHER_TEMPLATES}
          value={config.fullscreenStyle ?? ""}
          onChange={(fullscreenStyle) => updateConfig({ fullscreenStyle })}
        />
      )}

      {/* ================= LOCATIONS ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Locais (Temperatura)
          </h4>

          <button
            type="button"
            onClick={() =>
              updateConfig({
                locations: [
                  ...config.locations,
                  {
                    id: crypto.randomUUID(),
                    label: "Novo local",
                  },
                ],
              })
            }
            className="flex items-center gap-2 text-sm font-medium text-blue-600"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {config.locations.map((loc, index) => (
          <LocationEntryCard
            key={loc.id}
            label={loc.label}
            onLabelChange={(label) => updateLocation(index, { label })}
            location={loc.location}
            onLocationChange={(location) => {
              if (!location) {
                updateLocation(index, { location: undefined });
                return;
              }

              updateLocation(index, {
                location,
                label:
                  loc.label === "Novo local" || !loc.label
                    ? `${location.name}, ${location.country}`
                    : loc.label,
              });
            }}
            onRemove={() =>
              updateConfig({
                locations: config.locations.filter((l) => l.id !== loc.id),
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
