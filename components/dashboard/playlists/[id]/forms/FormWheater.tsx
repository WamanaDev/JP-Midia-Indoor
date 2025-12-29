// forms/WeatherForm.tsx
"use client";

import { MediaFormProps } from "@/interfaces/Medias";
import { Thermometer, Plus, Trash2 } from "lucide-react";

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

  /* ===== MODERNOS ===== */

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
];

// api/weather/cities.ts
export const CITIES: Record<string, { lat: number; lon: number }> = {
  // ===== BRASIL =====
  "São Paulo, BR": { lat: -23.5505, lon: -46.6333 },
  "Rio de Janeiro, BR": { lat: -22.9068, lon: -43.1729 },

  // Grande SP
  "Carapicuíba, BR": { lat: -23.5235, lon: -46.8407 },
  "Osasco, BR": { lat: -23.5324, lon: -46.7916 },
  "Barueri, BR": { lat: -23.5057, lon: -46.879 },
  "Santana de Parnaíba, BR": { lat: -23.4445, lon: -46.9178 },
  "Cotia, BR": { lat: -23.6022, lon: -46.919 },
  "Taboão da Serra, BR": { lat: -23.6261, lon: -46.7917 },
  "Embu das Artes, BR": { lat: -23.6489, lon: -46.8521 },
  "Itapevi, BR": { lat: -23.5488, lon: -46.9325 },
  "Jandira, BR": { lat: -23.5275, lon: -46.9023 },
  "São Bernardo do Campo, BR": { lat: -23.6914, lon: -46.5646 },
  "Santo André, BR": { lat: -23.6639, lon: -46.5383 },
  "São Caetano do Sul, BR": { lat: -23.6237, lon: -46.5548 },
  "Diadema, BR": { lat: -23.6865, lon: -46.6234 },
  "Guarulhos, BR": { lat: -23.4543, lon: -46.5337 },
  "Mauá, BR": { lat: -23.6678, lon: -46.4613 },
  "Ribeirão Pires, BR": { lat: -23.7102, lon: -46.4137 },
  "Suzano, BR": { lat: -23.5425, lon: -46.3117 },

  // ===== EUA =====
  "New York, US": { lat: 40.7128, lon: -74.006 },
  "Los Angeles, US": { lat: 34.0522, lon: -118.2437 },

  // ===== EUROPA =====
  "London, UK": { lat: 51.5074, lon: -0.1278 },
  "Paris, FR": { lat: 48.8566, lon: 2.3522 },
  "Rome, IT": { lat: 41.9028, lon: 12.4964 },
  "Madrid, ES": { lat: 40.4168, lon: -3.7038 },
  "Lisbon, PT": { lat: 38.7223, lon: -9.1393 },
  "Berlin, DE": { lat: 52.52, lon: 13.405 },

  // ===== ORIENTE MÉDIO / ÁSIA =====
  "Dubai, AE": { lat: 25.2048, lon: 55.2708 },
  "Tokyo, JP": { lat: 35.6762, lon: 139.6503 },
  "Seoul, KR": { lat: 37.5665, lon: 126.978 },
  "Bangkok, TH": { lat: 13.7563, lon: 100.5018 },
  "Singapore, SG": { lat: 1.3521, lon: 103.8198 },

  // ===== OUTROS =====
  "Sydney, AU": { lat: -33.8688, lon: 151.2093 },
  "Toronto, CA": { lat: 43.6532, lon: -79.3832 },
  "Mexico City, MX": { lat: 19.4326, lon: -99.1332 },
};

const WEATHER_LOCATIONS = Object.keys(CITIES).map((city) => ({
  id: city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(",", ""),
  label: city,
  city,
}));

export function WeatherForm({ value, onChange }: MediaFormProps) {
  const config = {
    overlay: false,
    position: "",
    style: "minimal",
    layout: "vertical",
    locations: [],
    ...value.config,
  };

  const updateConfig = (partial: Partial<typeof config>) => {
    onChange({
      ...value,
      config: {
        ...config,
        ...partial,
      },
    });
  };

  const updateLocation = (index: number, partial: any) => {
    const updated = [...config.locations];
    updated[index] = { ...updated[index], ...partial };
    updateConfig({ locations: updated });
  };

  return (
    <div className="space-y-8">
      {/* ================= OVERLAY ================= */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Sobrepor à mídia?
        </label>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              updateConfig({
                overlay: !config.overlay,
                position: "",
              })
            }
            className={`relative flex w-16 h-8 rounded-full transition-all duration-300 shadow-lg
              ${
                config.overlay
                  ? "bg-linear-to-r from-green-400 to-blue-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }
            `}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
                transform transition-transform duration-300
                ${config.overlay ? "translate-x-9" : "translate-x-1"}
              `}
            />
          </button>

          <span className="font-medium text-gray-700 dark:text-gray-300">
            {config.overlay ? "Sim" : "Não"}
          </span>
        </div>
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
                    city: "São Paulo",
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
          <div
            key={loc.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
          >
            {/* Nome exibido */}
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={loc.label}
                onChange={(e) =>
                  updateLocation(index, { label: e.target.value })
                }
                placeholder="Nome exibido"
                className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 text-sm focus:outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  updateConfig({
                    locations: config.locations.filter(
                      (l: any) => l.id !== loc.id
                    ),
                  })
                }
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* SELECT DE LOCAIS */}
            <select
              value={loc.city}
              onChange={(e) => updateLocation(index, { city: e.target.value })}
              className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 p-2 text-sm"
            >
              <option value="">Selecione um local</option>

              {WEATHER_LOCATIONS.map((place) => (
                <option key={place.id} value={place.city}>
                  {place.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
