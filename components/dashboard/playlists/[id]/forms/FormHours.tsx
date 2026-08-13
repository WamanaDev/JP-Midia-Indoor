"use client";

import { MediaFormProps } from "@/interfaces/Medias";
import { LocationValue } from "@/interfaces/Preview";
import { Clock, Plus } from "lucide-react";
import { OverlayToggle } from "./shared/OverlayToggle";
import { PositionPicker, OverlayPosition } from "./shared/PositionPicker";
import { StylePicker, StyleOption } from "./shared/StylePicker";
import { LayoutPicker, ItemLayout } from "./shared/LayoutPicker";
import { LocationEntryCard } from "./shared/LocationEntryCard";

/* ================= CONSTS ================= */

const STYLES: StyleOption[] = [
  {
    id: "minimal",
    label: "Minimalista",
    preview: <div className="text-xl font-semibold text-white">14:32</div>,
  },
  {
    id: "badge",
    label: "Badge",
    preview: (
      <div className="px-3 py-1 bg-white text-gray-800 text-sm font-medium rounded-full shadow">
        14:32
      </div>
    ),
  },
  {
    id: "card",
    label: "Cartão",
    preview: (
      <div className="flex items-center gap-2 bg-white text-gray-800 px-3 py-2 rounded-lg shadow">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">14:32</span>
      </div>
    ),
  },
  {
    id: "digital",
    label: "Digital",
    preview: (
      <div className="px-3 py-2 bg-black text-green-400 font-mono text-lg tracking-widest rounded shadow-inner">
        14:32
      </div>
    ),
  },
  {
    id: "glass",
    label: "Glass",
    preview: (
      <div className="backdrop-blur-md bg-white/20 border border-white/30 px-4 py-2 rounded-2xl shadow-xl">
        <span className="text-white text-lg font-semibold">14:32</span>
      </div>
    ),
  },
  {
    id: "pulse",
    label: "Pulse",
    preview: <div className="text-white text-xl font-bold">14:32</div>,
  },
  {
    id: "sphere",
    label: "Esfera 3D",
    preview: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-yellow-400 opacity-70 rotate-12" />
        <span className="relative text-sm font-semibold text-white drop-shadow">
          14:32
        </span>
      </div>
    ),
  },
  {
    id: "flip",
    label: "Flip",
    preview: (
      <div className="bg-black text-white font-mono text-xl px-4 py-2 rounded-xl shadow-lg">
        14:32
      </div>
    ),
  },
  {
    id: "flip3d",
    label: "Flip 3D",
    preview: (
      <div style={{ perspective: 300 }}>
        <div className="bg-black text-white font-mono text-lg px-3 py-2 rounded-lg shadow-lg [transform:rotateX(-18deg)]">
          14:32
        </div>
      </div>
    ),
  },
  {
    id: "analog-minimal",
    label: "Analógico Minimal",
    preview: (
      <div className="w-16 h-16 border-2 border-white rounded-full relative">
        <div className="absolute w-0.5 h-6 bg-white top-2 left-1/2 -translate-x-1/2" />
        <div className="absolute w-1 h-8 bg-white top-1 left-1/2 -translate-x-1/2 rotate-45" />
        <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    ),
  },
  {
    id: "analog-neon",
    label: "Analógico Neon",
    preview: (
      <div className="w-16 h-16 rounded-full bg-black border border-cyan-400 shadow-[0_0_12px_#22d3ee] relative">
        <div className="absolute w-1 h-6 bg-cyan-400 top-2 left-1/2 -translate-x-1/2 rotate-45 origin-bottom" />
        <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    ),
  },
  {
    id: "analog-corporate",
    label: "Analógico Corporate",
    preview: (
      <div className="w-16 h-16 rounded-full bg-white border border-gray-300 shadow relative">
        <div className="absolute w-1 h-6 bg-gray-700 top-2 left-1/2 -translate-x-1/2 rotate-45 origin-bottom" />
        <div className="absolute w-2 h-2 bg-gray-700 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    ),
  },
  {
    id: "chip-outline",
    label: "Contorno",
    preview: (
      <div className="border-2 border-white text-white text-lg font-semibold rounded-full px-4 py-1">
        14:32
      </div>
    ),
  },
  {
    id: "tag-ticket",
    label: "Etiqueta",
    preview: (
      <div className="relative bg-[#f4f1ea] text-neutral-800 font-mono text-lg rounded-md pl-6 pr-3 py-1">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ring-1 ring-inset ring-neutral-400 bg-black/5" />
        14:32
      </div>
    ),
  },
  {
    id: "mono-console",
    label: "Console",
    preview: (
      <div className="bg-black text-amber-400 font-mono text-lg px-3 py-1 rounded border border-amber-900/50">
        14:32
      </div>
    ),
  },
  {
    id: "neon-breathe",
    label: "Neon Respirando",
    preview: (
      <div className="border-2 border-violet-400 text-violet-100 text-lg font-semibold rounded-full px-4 py-1">
        14:32
      </div>
    ),
  },
  {
    id: "brand-strip",
    label: "Faixa de Marca",
    preview: (
      <div className="bg-emerald-400 text-emerald-950 font-bold text-lg px-3 py-1 rounded">
        14:32
      </div>
    ),
  },
  {
    id: "paper-tag",
    label: "Etiqueta de Papel",
    preview: (
      <div className="bg-[#f4f2ec] text-neutral-800 text-lg px-3 py-1 rounded-sm shadow">
        14:32
      </div>
    ),
  },
  {
    id: "led-strip",
    label: "Fita de LED",
    preview: (
      <div className="bg-black text-amber-400 font-mono text-lg tracking-[0.25em] px-3 py-1 border-b-2 border-dashed border-amber-500/50">
        14:32
      </div>
    ),
  },
  {
    id: "ribbon-corner",
    label: "Fita de Canto",
    preview: (
      <div className="-skew-x-12 bg-amber-500">
        <span className="inline-block skew-x-12 text-amber-950 font-bold text-lg px-4 py-1">
          14:32
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
        14:32
      </div>
    ),
  },
  {
    id: "icon-tight",
    label: "Ícone + Hora",
    preview: (
      <div className="flex items-center gap-1.5 bg-black/60 text-white text-base font-semibold rounded-full px-3 py-1">
        <Clock className="w-4 h-4" />
        14:32
      </div>
    ),
  },
];

const FULLSCREEN_TEMPLATES: StyleOption[] = [
  {
    id: "",
    label: "Nenhum (chip simples)",
    preview: <div className="text-white text-sm font-semibold">14:32</div>,
  },
  {
    id: "airport-split",
    label: "Split Aeroporto",
    preview: (
      <div className="flex w-full h-full">
        <div className="flex-1 bg-neutral-950 flex items-center justify-center text-white text-xs font-mono">
          14:32
        </div>
        <div className="flex-1 bg-blue-900" />
      </div>
    ),
  },
  {
    id: "transit-board",
    label: "Painel de Embarque",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <span className="text-amber-400 font-mono text-sm tracking-widest">14:32</span>
      </div>
    ),
  },
  {
    id: "boarding-pass",
    label: "Cartão de Embarque",
    preview: (
      <div className="w-full h-full bg-[#f4f2ec] flex items-center justify-center gap-2">
        <span className="text-neutral-900 font-mono text-xs">14:32</span>
        <span className="border-l border-dashed border-neutral-400 h-8" />
        <span className="text-neutral-500 text-[9px]">SP</span>
      </div>
    ),
  },
  {
    id: "stadium-scoreboard",
    label: "Placar de Estádio",
    preview: (
      <div className="w-full h-full bg-black border-y-4 border-amber-500 flex items-center justify-center">
        <span className="text-white font-mono font-black text-base">14:32</span>
      </div>
    ),
  },
  {
    id: "subway-panel",
    label: "Painel de Metrô",
    preview: (
      <div className="w-full h-full bg-[#04120c] flex items-center justify-center">
        <span className="text-emerald-400 font-mono text-sm">14:32</span>
      </div>
    ),
  },
  {
    id: "neon-marquee",
    label: "Letreiro Neon",
    preview: (
      <div className="w-full h-full bg-[#0a0a0d] flex items-center justify-center">
        <span className="border-2 border-amber-400 rounded px-2 py-1 text-amber-300 font-mono text-xs shadow-[0_0_8px_#f5a623]">
          14:32
        </span>
      </div>
    ),
  },
  {
    id: "terminal-readout",
    label: "Terminal",
    preview: (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <span className="text-green-400 font-mono text-sm">14:32_</span>
      </div>
    ),
  },
  {
    id: "data-wall",
    label: "Parede de Dados",
    preview: (
      <div className="w-full h-full bg-[#0a0d13] flex items-center justify-center">
        <span className="bg-amber-500/20 border border-amber-500 text-white font-mono text-xs px-2 py-1 rounded">
          14:32
        </span>
      </div>
    ),
  },
];

const TOGETHER_TEMPLATES: StyleOption[] = [
  {
    id: "",
    label: "Nenhum (chip repetido)",
    preview: <div className="text-white text-sm font-semibold">14:32</div>,
  },
  {
    id: "departure-table",
    label: "Painel de Partidas",
    preview: (
      <div className="w-full h-full bg-[#0a0d13] flex flex-col items-center justify-center gap-1 text-white/80 text-[9px] font-mono">
        <div className="flex justify-between w-16"><span>SP</span><span>14:32</span></div>
        <div className="flex justify-between w-16"><span>RJ</span><span>15:32</span></div>
      </div>
    ),
  },
  {
    id: "ribbon-stack",
    label: "Pilha de Faixas",
    preview: (
      <div className="w-full h-full bg-[#0d0f14] flex flex-col items-center justify-center gap-1">
        <span className="bg-teal-400 text-teal-950 text-[9px] px-2 py-0.5 rounded">SP 14:32</span>
        <span className="bg-amber-400 text-amber-950 text-[9px] px-2 py-0.5 rounded">RJ 15:32</span>
      </div>
    ),
  },
  {
    id: "clock-wall",
    label: "Mural de Relógios",
    preview: (
      <div className="w-full h-full bg-[#0d1119] flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full border border-white/60" />
        <div className="w-8 h-8 rounded-full border border-white/60" />
      </div>
    ),
  },
  {
    id: "glass-panels",
    label: "Painéis de Vidro",
    preview: (
      <div className="w-full h-full flex">
        <div className="flex-1 bg-white/10 flex items-center justify-center text-white text-[9px] font-mono">14:32</div>
        <div className="flex-1 bg-white/5 border-l border-white/15 flex items-center justify-center text-white text-[9px] font-mono">15:32</div>
      </div>
    ),
  },
  {
    id: "timeline-row",
    label: "Linha do Tempo",
    preview: (
      <div className="w-full h-full bg-[#0d1119] flex items-center justify-center gap-4 text-white text-[9px] font-mono">
        <span>14:32</span>
        <span className="w-6 h-px bg-white/30" />
        <span>15:32</span>
      </div>
    ),
  },
  {
    id: "corporate-lobby",
    label: "Lobby Corporativo",
    preview: (
      <div className="w-full h-full bg-white flex items-center justify-center gap-3">
        <span className="text-neutral-900 text-[9px] font-mono border-b-2 border-blue-500">14:32</span>
        <span className="text-neutral-900 text-[9px] font-mono border-b-2 border-blue-500">15:32</span>
      </div>
    ),
  },
  {
    id: "transit-multiboard",
    label: "Multi-painel de Embarque",
    preview: (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-1 text-amber-400 text-[9px] font-mono">
        <span>SP · 14:32</span>
        <span>RJ · 15:32</span>
      </div>
    ),
  },
];

/* ================= TYPES ================= */

type ClockConfig = {
  id: string;
  label: string;
  location?: LocationValue;
  format: "12h" | "24h";
};

/* ================= FORM ================= */

export function TimeForm({ value, onChange }: MediaFormProps) {
  const config = {
    overlay: false,
    position: "",
    style: "minimal",
    layout: "vertical",
    fullscreenStyle: undefined as string | undefined,
    clocks: [] as ClockConfig[],
    ...(value.config ?? {}),
  };

  /* ================= UPDATE CONFIG ================= */

  const updateConfig = (partial: Partial<typeof config>) => {
    onChange({
      ...value,
      config: { ...config, ...partial },
    });
  };

  const updateClock = (index: number, partial: Partial<ClockConfig>) => {
    const clocks = [...config.clocks];
    clocks[index] = { ...clocks[index], ...partial };
    updateConfig({ clocks });
  };

  /* ================= UI ================= */

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

      {/* ================= CLOCKS ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Relógios
          </h4>

          <button
            type="button"
            onClick={() =>
              updateConfig({
                clocks: [
                  ...config.clocks,
                  {
                    id: crypto.randomUUID(),
                    label: "Novo local",
                    format: "24h",
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

        {config.clocks.map((clock, index) => (
          <LocationEntryCard
            key={clock.id}
            label={clock.label}
            onLabelChange={(label) => updateClock(index, { label })}
            location={clock.location}
            onLocationChange={(location) => updateClock(index, { location })}
            onRemove={() =>
              updateConfig({
                clocks: config.clocks.filter((c) => c.id !== clock.id),
              })
            }
          >
            <select
              value={clock.format}
              onChange={(e) =>
                updateClock(index, {
                  format: e.target.value as "12h" | "24h",
                })
              }
              className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 p-2 text-sm"
            >
              <option value="24h">Formato 24h</option>
              <option value="12h">Formato 12h</option>
            </select>
          </LocationEntryCard>
        ))}
      </div>
    </div>
  );
}
