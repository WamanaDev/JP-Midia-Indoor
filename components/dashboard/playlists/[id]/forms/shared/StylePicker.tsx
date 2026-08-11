"use client";

import { ReactNode } from "react";

export interface StyleOption {
  id: string;
  label: string;
  preview: ReactNode;
}

interface StylePickerProps {
  title?: string;
  styles: StyleOption[];
  value: string;
  onChange: (id: string) => void;
}

export function StylePicker({
  title = "Modelo de exibição",
  styles,
  value,
  onChange,
}: StylePickerProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {styles.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={`flex flex-col items-center justify-between p-4 border rounded-xl shadow-sm transition ${
              value === style.id
                ? "border-blue-500 bg-blue-50 dark:bg-gray-900"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
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
  );
}
