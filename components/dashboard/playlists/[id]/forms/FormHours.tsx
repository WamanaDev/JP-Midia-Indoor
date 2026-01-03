"use client";

import { MediaFormProps } from "@/interfaces/Medias";
import { LocationValue } from "@/interfaces/Preview";
import { Clock, Trash2, Plus } from "lucide-react";
import { LocationSelect } from "./LocationSelect";

/* ================= CONSTS ================= */

const POSITIONS = [
  { id: "top-left", label: "Superior Esquerdo" },
  { id: "top-right", label: "Superior Direito" },
  { id: "bottom-left", label: "Inferior Esquerdo" },
  { id: "bottom-right", label: "Inferior Direito" },
];

const STYLES = [
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
  const isClockValid = (clock: ClockConfig) =>
    !!clock.location && !!clock.location.lat && !!clock.location.lon;
  /* ================= UPDATE CONFIG ================= */

  const updateConfig = (partial: Partial<typeof config>) => {
    const nextConfig = { ...config, ...partial };

    const hasInvalidClock = nextConfig.clocks?.some(
      (c: ClockConfig) => !isClockValid(c)
    );

    if (hasInvalidClock) {
      console.warn("Config inválida: relógio sem localização");
      return;
    }

    onChange({
      ...value,
      config: nextConfig,
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
      {/* ================= OVERLAY ================= */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Sobrepor à mídia?</label>

        <button
          type="button"
          onClick={() =>
            updateConfig({ overlay: !config.overlay, position: "" })
          }
          className={`relative w-16 h-8 rounded-full transition ${
            config.overlay
              ? "bg-linear-to-r from-green-400 to-blue-500"
              : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition ${
              config.overlay ? "translate-x-8" : ""
            }`}
          />
        </button>
      </div>

      {/* ================= POSITION ================= */}
      {config.overlay && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Posição na tela
          </label>

          <div className="grid grid-cols-2 grid-rows-2 w-full md:w-60 h-60 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {POSITIONS.map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => updateConfig({ position: pos.id })}
                className={`text-xs font-medium flex items-center justify-center transition-colors
                  ${
                    config.position === pos.id
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= STYLE ================= */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Modelo de exibição
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => updateConfig({ style: style.id })}
              className={`flex flex-col items-center justify-between p-4 border rounded-xl shadow-sm transition
                ${
                  config.style === style.id
                    ? "border-blue-500 bg-blue-50 dark:bg-gray-900"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
            >
              <div className="flex items-center justify-center h-20 w-full bg-gray-900 rounded-lg">
                {style.preview}
              </div>

              <span className="mt-3 font-medium text-gray-900 dark:text-white">
                {style.label}
              </span>
            </button>
          ))}
        </div>
      </div>

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
          <div
            key={clock.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <input
                value={clock.label}
                onChange={(e) => updateClock(index, { label: e.target.value })}
                className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 text-sm focus:outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  updateConfig({
                    clocks: config.clocks.filter((c) => c.id !== clock.id),
                  })
                }
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            {/* 🔥 LOCALIZAÇÃO DINÂMICA */}
            {!clock.location && (
              <span className="text-xs text-red-500">
                Selecione uma localização válida
              </span>
            )}
            <LocationSelect
              value={clock.location}
              onChange={(loc) => updateClock(index, { location: loc })}
            />
            <select
              value={clock.format}
              onChange={(e) =>
                updateClock(index, {
                  format: e.target.value as "12h" | "24h",
                })
              }
              className="w-full rounded-lg bg-gray-100 p-2 text-sm"
            >
              <option value="24h">Formato 24h</option>
              <option value="12h">Formato 12h</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
