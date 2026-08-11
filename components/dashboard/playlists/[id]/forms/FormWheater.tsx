"use client";

import { MediaFormProps } from "@/interfaces/Medias";
import { Thermometer } from "lucide-react";
import { WeatherLocation } from "@/interfaces/Preview";
import { useMemo } from "react";
import { OverlayToggle } from "./shared/OverlayToggle";
import { PositionPicker, OverlayPosition } from "./shared/PositionPicker";
import { StylePicker, StyleOption } from "./shared/StylePicker";
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
    id: "wave",
    label: "Onda",
    preview: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute w-12 h-12 rounded-full bg-sky-400 opacity-30" />
        <span className="relative text-sm font-semibold text-white">26°C</span>
      </div>
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
];

/* ================= FORM ================= */

export function WeatherForm({ value, onChange }: MediaFormProps) {
  const config = useMemo(
    () => ({
      overlay: false,
      position: "",
      style: "minimal",
      layout: "vertical",
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

      <StylePicker
        styles={STYLES}
        value={config.style}
        onChange={(style) => updateConfig({ style })}
      />

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
