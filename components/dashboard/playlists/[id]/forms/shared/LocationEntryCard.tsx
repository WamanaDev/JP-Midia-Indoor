"use client";

import { Trash2 } from "lucide-react";
import { ReactNode } from "react";
import { LocationValue } from "@/interfaces/Preview";
import { LocationSelect } from "../LocationSelect";

interface LocationEntryCardProps {
  label: string;
  onLabelChange: (label: string) => void;
  location?: LocationValue;
  onLocationChange: (location: LocationValue | undefined) => void;
  onRemove: () => void;
  children?: ReactNode;
}

const DEFAULT_LABEL = "Novo local";

export function LocationEntryCard({
  label,
  onLabelChange,
  location,
  onLocationChange,
  onRemove,
  children,
}: LocationEntryCardProps) {
  const handleLocationChange = (next: LocationValue | undefined) => {
    onLocationChange(next);

    // Se o nome exibido ainda é o placeholder padrão (ou está vazio), usa o
    // nome do local escolhido em vez de deixar "Novo local" pra sempre.
    if (next && (!label.trim() || label === DEFAULT_LABEL)) {
      onLabelChange(next.name);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="Nome exibido"
          className="flex-1 bg-transparent border-b border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none"
        />

        <button type="button" onClick={onRemove}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {!location && (
        <p className="text-xs text-red-500">Selecione uma localização válida</p>
      )}

      <LocationSelect value={location} onChange={handleLocationChange} />

      {children}
    </div>
  );
}
