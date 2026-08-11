"use client";

export type OverlayPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const POSITIONS: { id: OverlayPosition; label: string }[] = [
  { id: "top-left", label: "Superior Esquerdo" },
  { id: "top-right", label: "Superior Direito" },
  { id: "bottom-left", label: "Inferior Esquerdo" },
  { id: "bottom-right", label: "Inferior Direito" },
];

interface PositionPickerProps {
  value: string;
  onChange: (position: OverlayPosition) => void;
}

export function PositionPicker({ value, onChange }: PositionPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        Posição na tela
      </label>

      <div className="grid grid-cols-2 grid-rows-2 w-full md:w-60 h-60 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {POSITIONS.map((pos) => (
          <button
            key={pos.id}
            type="button"
            onClick={() => onChange(pos.id)}
            className={`text-xs font-medium flex items-center justify-center transition-colors ${
              value === pos.id
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {pos.label}
          </button>
        ))}
      </div>
    </div>
  );
}
