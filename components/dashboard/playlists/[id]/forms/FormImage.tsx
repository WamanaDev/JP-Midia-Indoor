"use client";

import UploadButton from "@/components/dashboard/medias/UploadButton";
import { ImageFormProps } from "@/interfaces/Medias";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export function ImageForm({ value, onChange, images }: ImageFormProps) {
  const selected = value.media_file_id;

  const selectImage = (id: string) => onChange({ ...value, media_file_id: id });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Selecionar imagem</h3>
        <UploadButton />
      </div>
      {!images ||
        (images.length === 0 && (
          <div className="text-sm text-gray-500">
            Nenhuma imagem enviada ainda.
          </div>
        ))}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images &&
          images.map((img) => (
            <button
              type="button"
              key={img.id}
              onClick={() => selectImage(img.id)}
              className={`
              rounded-xl border overflow-hidden transition
              ${
                selected === img.id
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-blue-400"
              }
            `}
            >
              <div className="aspect-video bg-gray-100 relative">
                <Image
                  src={img.storage_path}
                  alt={img.original_name}
                  fill
                  className="w-full h-full object-cover"
                />

                {selected === img.id && (
                  <div className="absolute inset-0 bg-blue-500/20" />
                )}
              </div>

              <div className="p-3 text-left">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium truncate">
                    {img.original_name}
                  </span>
                </div>
              </div>
            </button>
          ))}
      </div>
      {/* Duração */}
      <div>
        <label className="text-sm font-medium">Tempo na tela (s)</label>
        <input
          type="number"
          value={value.duration_override ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              duration_override:
                e.target.value === "" ? null : Number(e.target.value),
            })
          }
          className="mt-1 w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>
  );
}
