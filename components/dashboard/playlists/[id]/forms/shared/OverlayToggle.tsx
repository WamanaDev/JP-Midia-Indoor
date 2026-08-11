"use client";

interface OverlayToggleProps {
  label?: string;
  enabled: boolean;
  onToggle: () => void;
}

export function OverlayToggle({
  label = "Sobrepor à mídia?",
  enabled,
  onToggle,
}: OverlayToggleProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggle}
          className={`relative flex w-16 h-8 rounded-full transition ${
            enabled
              ? "bg-linear-to-r from-green-400 to-blue-500"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              enabled ? "translate-x-9" : "translate-x-1"
            }`}
          />
        </button>

        <span className="font-medium text-gray-700 dark:text-gray-300">
          {enabled ? "Sim" : "Não"}
        </span>
      </div>
    </div>
  );
}
