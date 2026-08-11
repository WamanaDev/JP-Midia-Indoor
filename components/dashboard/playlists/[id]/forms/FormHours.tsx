"use client";

import { MediaFormProps } from "@/interfaces/Medias";
import { LocationValue } from "@/interfaces/Preview";
import { Clock, Plus } from "lucide-react";
import { OverlayToggle } from "./shared/OverlayToggle";
import { PositionPicker, OverlayPosition } from "./shared/PositionPicker";
import { StylePicker, StyleOption } from "./shared/StylePicker";
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
    id: "flip",
    label: "Flip",
    preview: (
      <div className="bg-black text-white font-mono text-xl px-4 py-2 rounded-xl shadow-lg">
        14:32
      </div>
    ),
  },
  {
    id: "pulse",
    label: "Pulse",
    preview: <div className="text-white text-xl font-bold">14:32</div>,
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
    id: "orbit",
    label: "Órbita",
    preview: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-white/30" />
        <div className="absolute w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_2px_rgba(34,211,238,0.7)] top-1 left-1/2 -translate-x-1/2" />
        <span className="text-sm font-semibold text-white">14:32</span>
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

      <StylePicker
        styles={STYLES}
        value={config.style}
        onChange={(style) => updateConfig({ style })}
      />

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
