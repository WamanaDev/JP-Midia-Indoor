"use client";

import { deleteMediaAction } from "@/app/dashboard/medias/actions";
import { Media } from "@/interfaces/Medias";
import { Video, Eye, Trash2, Image as Img } from "lucide-react";
import Image from "next/image";

interface Props {
  media: Media;
  onPreview: (url: string) => void;
}

export function MediaCard({ media, onPreview }: Props) {
  const isImage = media.mime_type.startsWith("image/");
  const isVideo = media.mime_type.startsWith("video");
  // Thumbnails de vídeo são geradas no upload (ver UploadButton); sem uma
  // (upload antigo ou geração falhou), mostramos o ícone de vídeo em vez
  // de tentar renderizar o arquivo de vídeo como imagem.
  const url = isImage ? media.storage_path : media.thumbnail_path || "";

  const handleDelete = async () => {
    if (!confirm(`Deseja realmente deletar "${media.original_name}"?`)) return;

    try {
      await deleteMediaAction(media.filename, media.id);
      alert("Arquivo deletado com sucesso!");
    } catch (err: unknown) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao deletar arquivo";

      alert("Erro ao deletar arquivo: " + message);
    }
  };

  return (
    <div
      key={media.id}
      className="relative rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow border border-gray-200 dark:border-gray-700"
    >
      <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-900 overflow-hidden group">
        {/* Imagem */}
        {isImage ? (
          <Image
            src={media.storage_path}
            alt="image"
            fill
            className="object-cover"
          />
        ) : isVideo ? (
          url ? (
            <Image
              src={url}
              className="w-full h-full object-cover"
              fill
              alt={url}
            />
          ) : (
            <Video className="absolute top-1/2 left-1/2 w-10 h-10 text-gray-500 -translate-x-1/2 -translate-y-1/2" />
          )
        ) : (
          <Img className="absolute top-1/2 left-1/2 w-10 h-10 text-gray-500 -translate-x-1/2 -translate-y-1/2" />
        )}

        {/* Overlay dos botões */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-80 flex items-center justify-center gap-3 transition-opacity duration-300">
          <button
            onClick={() => onPreview(media.storage_path)}
            className="p-2 bg-white rounded-lg cursor-pointer"
          >
            <Eye className="w-5 h-5 text-black" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-red-600 rounded-lg cursor-pointer"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2">
          {isImage ? (
            <Img className="w-4 h-4 text-blue-500 dark:text-blue-200" />
          ) : isVideo ? (
            <Video className="w-4 h-4 text-purple-500 dark:text-purple-200" />
          ) : (
            <Img className="w-4 h-4 text-gray-400" />
          )}
          <h3 className="text-sm font-semibold truncate dark:text-white">
            {media.original_name}
          </h3>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {" "}
            {media.size_bytes < 1024
              ? media.size_bytes + " B"
              : media.size_bytes < 1024 * 1024
              ? (media.size_bytes / 1024).toFixed(1) + " KB"
              : (media.size_bytes / (1024 * 1024)).toFixed(2) + " MB"}
          </span>
          <span>{new Date(media.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
