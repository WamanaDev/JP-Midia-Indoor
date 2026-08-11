"use client";

import { Media } from "@/interfaces/Medias";
import { Image as Img, X } from "lucide-react";
import { useState } from "react";
import { MediaCard } from "./MediaCard";
import Image from "next/image";
import UploadButton from "./UploadButton";
import { UsageBadge } from "@/components/dashboard/UsageBadge";

interface Props {
  medias: Media[] | null;
  currentStorageGb: number;
  maxStorageGb: number | null;
}

export function Medias({ medias, currentStorageGb, maxStorageGb }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Abaixo de 1 GB, duas casas decimais em GB arredondam pra "0.00" e o uso
  // real fica invisível — mostra em MB nesse caso.
  const formattedCurrent =
    currentStorageGb < 1
      ? `${(currentStorageGb * 1024).toFixed(1)} MB`
      : undefined;
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Mídias</h2>
          <p className="text-gray-500">Gerencie suas mídias</p>
        </div>
        <UploadButton />
      </header>

      <UsageBadge
        label="Armazenamento"
        current={currentStorageGb}
        formattedCurrent={formattedCurrent}
        max={maxStorageGb}
        unit="GB"
        decimals={2}
      />

      {!medias || medias.length === 0 ? (
        <div className="text-center p-12 border rounded-xl">
          <Img className="mx-auto w-12 h-12 text-gray-400" />
          <p className="mt-4 text-gray-500">Nenhuma mídia cadastrada</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medias &&
            medias.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                onPreview={(url: string) => setPreviewUrl(url)}
              />
            ))}
        </div>
      )}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          {/* Botão de fechar */}
          <button
            className="cursor-pointer absolute top-5 right-5 p-2 bg-white rounded-full z-50"
            onClick={(e) => {
              e.stopPropagation(); // evita fechar quando clica no botão
              setPreviewUrl(null);
            }}
          >
            <X className="w-6 h-6 text-black" />
          </button>

          {/* Container da mídia */}
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            {previewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
              <Image
                src={previewUrl}
                alt="Preview"
                width={1920} // largura máxima aproximada
                height={1080} // altura máxima aproximada
                className="object-contain max-h-[90vh] max-w-full"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="max-h-[90vh] max-w-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
