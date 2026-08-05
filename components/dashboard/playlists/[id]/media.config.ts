// app/dashboard/playlists/media.config.ts
import {
  Image,
  Video,
  Newspaper,
  CloudSun,
  FileSpreadsheet,
  FileText,
  LucideIcon,
  Clock,
} from "lucide-react";

export type MediaType =
  | "image"
  | "video"
  | "news"
  | "temperature"
  | "google-sheets"
  | "document"
  | "hours";

export type MediaCategory = {
  id: string;
  label: string;
  items: MediaItem[];
};

export type MediaItem = {
  type: MediaType;
  label: string;
  icon: LucideIcon;
  color: string;
};

export const MEDIA_CATEGORIES: MediaCategory[] = [
  {
    id: "visual",
    label: "Mídias Visuais",
    items: [
      {
        type: "image",
        label: "Imagem",
        icon: Image,
        color: "text-blue-600",
      },
      {
        type: "video",
        label: "Vídeo",
        icon: Video,
        color: "text-purple-600",
      },
      {
        type: "document",
        label: "Documento (PDF)",
        icon: FileText,
        color: "text-red-600",
      },
    ],
  },
  {
    id: "dynamic",
    label: "Conteúdo Dinâmico",
    items: [
      {
        type: "news",
        label: "Notícias",
        icon: Newspaper,
        color: "text-green-600",
      },
      {
        type: "temperature",
        label: "Clima",
        icon: CloudSun,
        color: "text-yellow-500",
      },
      {
        type: "hours",
        label: "Hora",
        icon: Clock,
        color: "text-pink-500",
      },
    ],
  },
  {
    id: "external",
    label: "Integrações",
    items: [
      {
        type: "google-sheets",
        label: "Google Planilhas",
        icon: FileSpreadsheet,
        color: "text-emerald-600",
      },
    ],
  },
];

export function getMediaCategoryByType(type: string) {
  for (const category of MEDIA_CATEGORIES) {
    const item = category.items.find((item) => item.type === type);

    if (item) {
      return {
        categoryId: category.id,
        categoryLabel: category.label,
        ...item,
      };
    }
  }

  return null;
}
