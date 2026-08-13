"use client";

export type ItemLayout = "vertical" | "horizontal" | "rotate";

const LAYOUTS: { id: ItemLayout; label: string; hint: string }[] = [
  { id: "vertical", label: "Empilhado", hint: "todos juntos, um embaixo do outro" },
  { id: "horizontal", label: "Lado a lado", hint: "todos juntos, em linha" },
  { id: "rotate", label: "Rodar", hint: "um de cada vez, revezando" },
];

interface LayoutPickerProps {
  value: string;
  onChange: (layout: ItemLayout) => void;
}

/** Só faz diferença quando há mais de uma entrada (relógio/local) configurada. */
export function LayoutPicker({ value, onChange }: LayoutPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        Como mostrar em tela cheia
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => onChange(layout.id)}
            className={`text-left p-3 rounded-lg border transition-colors ${
              value === layout.id
                ? "border-blue-500 bg-blue-50 dark:bg-gray-900"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
              {layout.label}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {layout.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
