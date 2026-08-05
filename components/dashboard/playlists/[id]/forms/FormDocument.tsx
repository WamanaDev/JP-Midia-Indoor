"use client";

import UploadButton from "@/components/dashboard/medias/UploadButton";
import { DocumentFormProps } from "@/interfaces/Medias";
import { FileText } from "lucide-react";
import Image from "next/image";

export function FormDocument({ value, onChange, documents }: DocumentFormProps) {
  const selected = value.media_file_id;

  const selectDocument = (id: string) =>
    onChange({ ...value, media_file_id: id });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Selecionar documento (PDF)</h3>
        <UploadButton />
      </div>

      {!documents ||
        (documents.length === 0 && (
          <div className="text-sm text-gray-500">
            Nenhum documento enviado ainda.
          </div>
        ))}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {documents &&
          documents.map((doc) => (
            <button
              type="button"
              key={doc.id}
              onClick={() => selectDocument(doc.id)}
              className={`
              rounded-xl border overflow-hidden transition text-left
              ${
                selected === doc.id
                  ? "border-red-500 ring-2 ring-red-200"
                  : "border-gray-200 hover:border-red-400"
              }
            `}
            >
              <div className="aspect-video bg-gray-100 relative">
                {doc.thumbnail_path ? (
                  <Image
                    src={doc.thumbnail_path}
                    alt={doc.original_name}
                    fill
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-10 h-10 text-gray-400 m-auto" />
                )}

                {selected === doc.id && (
                  <div className="absolute inset-0 bg-red-500/20" />
                )}
              </div>

              <div className="p-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium truncate">
                    {doc.original_name}
                  </span>
                </div>
              </div>
            </button>
          ))}
      </div>

      {/* Segundos por página */}
      <div>
        <label className="text-sm font-medium">Segundos por página</label>
        <p className="text-xs text-gray-500 mb-1">
          O documento passa as páginas automaticamente na tela, no tempo
          configurado aqui, antes de seguir para o próximo item da playlist.
        </p>
        <input
          type="number"
          min={1}
          value={value.duration_override ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              duration_override:
                e.target.value === "" ? null : Number(e.target.value),
            })
          }
          className="mt-1 w-full px-4 py-2 border rounded-lg"
          placeholder="Ex: 8"
        />
      </div>
    </div>
  );
}
