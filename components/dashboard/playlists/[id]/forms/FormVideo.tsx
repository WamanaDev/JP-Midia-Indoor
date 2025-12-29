"use client";

import { Eye, Video as VideoIcon } from "lucide-react";
import { useState } from "react";
import { VideoFormProps } from "@/interfaces/Medias";
import UploadButton from "@/components/dashboard/medias/UploadButton";
import Image from "next/image";

export function VideoForm({ value, onChange, videos }: VideoFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selected = value.media_file_id;

  const selectVideo = (id: string) => onChange({ ...value, media_file_id: id });

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Selecionar Vídeo</h3>
        <UploadButton />
      </div>

      {!videos ||
        (videos.length === 0 && (
          <div className="text-sm text-gray-500">
            Nenhum vídeo enviado ainda.
          </div>
        ))}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {videos &&
          videos.map((video) => (
            <button
              type="button"
              key={video.id}
              onClick={() => selectVideo(video.id)}
              className={`
              rounded-xl border overflow-hidden transition text-left
              ${
                selected === video.id
                  ? "border-purple-500 ring-2 ring-purple-200"
                  : "border-gray-200 hover:border-purple-400"
              }
            `}
            >
              {/* Thumb */}
              <div className="aspect-video bg-gray-100 relative group">
                {video.thumbnail_path ? (
                  <Image
                    src={video.thumbnail_path}
                    alt={video.original_name}
                    fill
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <VideoIcon className="w-10 h-10 text-gray-400 m-auto" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(video.storage_path);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-lg"
                  >
                    <Eye className="w-5 h-5 text-black" />
                  </button>
                </div>

                {selected === video.id && (
                  <div className="absolute inset-0 bg-purple-500/20" />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <VideoIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium truncate">
                    {video.original_name}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {video.size_bytes < 1024
                      ? `${video.size_bytes} B`
                      : video.size_bytes < 1024 * 1024
                      ? `${(video.size_bytes / 1024).toFixed(1)} KB`
                      : `${(video.size_bytes / 1024 / 1024).toFixed(2)} MB`}
                  </span>
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
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
          placeholder="Ex: 10"
        />
      </div>

      {/* Preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setPreviewUrl(null)}
        >
          <video
            src={previewUrl}
            controls
            autoPlay
            className="max-w-5xl max-h-[90vh]"
          />
        </div>
      )}
    </div>
  );
}
