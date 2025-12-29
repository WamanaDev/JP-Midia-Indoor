import { PlaylistItems } from "@/interfaces/Playlists";
import {
  Edit2,
  Trash2,
  Newspaper,
  CloudSun,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Image from "next/image";
import { getMediaCategoryByType } from "./media.config";

interface Props {
  playlistItem: PlaylistItems;
  max: number;
  onEdit: (playlistItem: PlaylistItems) => void;
  onMoveUp: (playlistItem: PlaylistItems) => void;
  onMoveDown: (playlistItem: PlaylistItems) => void;
  onDelete: (playlistItem: PlaylistItems) => void;
}

export function PlaylistItemCard({
  playlistItem,
  max,
  onEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  const mediaMeta = getMediaCategoryByType(playlistItem.type);
  let preview;
  if (playlistItem.media_file_id && playlistItem.media_files) {
    let url;
    if (playlistItem.media_files.thumbnail_path) {
      url = encodeURI(playlistItem.media_files.thumbnail_path);
    } else {
      url = encodeURI(playlistItem.media_files.storage_path);
    }
    preview = (
      <Image
        className="rounded border"
        src={url}
        fill
        alt={playlistItem.media_files.original_name}
      />
    );
  } else {
    if (playlistItem.type === "news") {
      preview = (
        <Newspaper className={mediaMeta?.color} width={100} height={100} />
      );
    }
    if (playlistItem.type === "temperature") {
      preview = (
        <CloudSun className={mediaMeta?.color} width={100} height={100} />
      );
    }
    if (playlistItem.type === "hours") {
      preview = <Clock className={mediaMeta?.color} width={100} height={100} />;
    }
  }
  return (
    <>
      <div
        key={playlistItem.id}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
      >
        {/* Header */}
        <div className="md:flex items-start justify-between gap-4">
          <div className="w-full md:w-25 aspect-square relative">{preview}</div>
          <div className="flex-1">
            {/* Nome e status */}
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                  {mediaMeta?.label}{" "}
                  <small className={mediaMeta?.color}>
                    {playlistItem.media_files?.original_name}
                  </small>
                </h3>
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-2xl px-2 py-1 text-xs font-bold">
                  <small>{playlistItem.order_index}</small>
                </div>
              </div>
              <div className="hidden md:flex bg-gray-900/40 md:bg-gray-900/0 mt-2 md:mt-0 rounded justify-between px-5 md:px-0 items-center gap-2 shrink-0">
                {playlistItem.order_index > 0 && (
                  <button
                    type="button"
                    className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => onMoveUp(playlistItem)}
                  >
                    <ArrowUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                {playlistItem.order_index !== max - 1 && (
                  <button
                    type="button"
                    onClick={() => onMoveDown(playlistItem)}
                    className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ArrowDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}

                <button
                  className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Editar"
                  onClick={() => onEdit(playlistItem)}
                >
                  <Edit2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </button>
                <button
                  className="cursor-pointer p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Excluir"
                  onClick={() => onDelete(playlistItem)}
                >
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            {playlistItem.start_view && playlistItem.end_view && (
              <div className="flex flex-wrap gap-3 text-xs text-gray-900 dark:text-white">
                <span className="py-1 rounded-2xl">
                  <span className="bg-sky-200 dark:bg-sky-900/80 rounded-l-full px-2 py-1 font-bold">
                    Mídias:
                  </span>
                  <span className="bg-sky-100 dark:bg-sky-900/40 rounded-r-full px-2 py-1"></span>
                </span>
                <span className="py-1 rounded-2xl">
                  <span className="bg-pink-200 dark:bg-pink-900/80 rounded-l-full px-2 py-1 font-bold">
                    Telas:
                  </span>
                  <span className="bg-pink-100 dark:bg-pink-900/40 rounded-r-full px-2 py-1"></span>
                </span>
              </div>
            )}

            {playlistItem.type !== "news" &&
              playlistItem.type !== "temperature" &&
              playlistItem.type !== "hours" && (
                <div className="bg-gray-100 dark:bg-gray-900/40 p-2 mt-2 rounded">
                  <span className="text-xs font-bold">Outras informações:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {playlistItem.duration_override && (
                      <span
                        key={`duration`}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-2 py-1 text-xs rounded-full"
                      >
                        <b>Duração:</b> {playlistItem.duration_override}{" "}
                        segundos
                      </span>
                    )}
                    {playlistItem.config && (
                      <span
                        key={`overlay`}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-2 py-1 text-xs rounded-full"
                      >
                        <b>Sobreposto:</b>{" "}
                        {playlistItem.config.overlay ? "Sim" : "Não"}
                      </span>
                    )}
                  </div>
                </div>
              )}

            {playlistItem.type === "news" && playlistItem.config?.news && (
              <div className="bg-gray-100 dark:bg-gray-900/40 p-2 mt-2 rounded">
                <span className="text-xs font-bold">Outras informações:</span>

                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(
                    playlistItem.config.news as Record<string, string[]>
                  ).map(([vehicle, feeds]) => (
                    <span
                      key={vehicle}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-2 py-1 text-xs rounded-full"
                    >
                      <b>{vehicle}</b>: {feeds?.length ?? 0} categorias
                    </span>
                  ))}

                  {playlistItem.duration_override && (
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 px-2 py-1 text-xs rounded-full">
                      <b>Duração:</b> {playlistItem.duration_override}s
                    </span>
                  )}

                  {typeof playlistItem.config.overlay === "boolean" && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 px-2 py-1 text-xs rounded-full">
                      <b>Sobreposto:</b>{" "}
                      {playlistItem.config.overlay ? "Sim" : "Não"}
                    </span>
                  )}
                </div>
              </div>
            )}
            {(playlistItem.type === "temperature" ||
              playlistItem.type === "hours") &&
              playlistItem.config && (
                <div className="bg-gray-100 dark:bg-gray-900/40 p-2 mt-2 rounded">
                  <span className="text-xs font-bold">
                    Configuração do clima:
                  </span>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {playlistItem.config.style && (
                      <span className="bg-sky-100 dark:bg-sky-900/30 text-sky-900 dark:text-sky-300 px-2 py-1 text-xs rounded-full">
                        <b>Estilo:</b> {playlistItem.config.style}
                      </span>
                    )}

                    {typeof playlistItem.config.overlay === "boolean" && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 px-2 py-1 text-xs rounded-full">
                        <b>Sobreposto:</b>{" "}
                        {playlistItem.config.overlay ? "Sim" : "Não"}
                      </span>
                    )}

                    {playlistItem.config.position && (
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 px-2 py-1 text-xs rounded-full">
                        <b>Posição:</b> {playlistItem.config.position}
                      </span>
                    )}

                    {playlistItem.duration_override && (
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-300 px-2 py-1 text-xs rounded-full">
                        <b>Duração:</b> {playlistItem.duration_override}s
                      </span>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Ações */}
          <div className="flex md:hidden bg-gray-900/40 md:bg-gray-900/0 mt-2 md:mt-0 rounded justify-between px-5 md:px-0 flex-row md:flex-col items-center gap-2 shrink-0">
            {playlistItem.order_index > 0 && (
              <button
                type="button"
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => onMoveUp(playlistItem)}
              >
                <ArrowUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            {playlistItem.order_index !== max - 1 && (
              <button
                type="button"
                onClick={() => onMoveDown(playlistItem)}
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            <button
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Editar"
              onClick={() => onEdit(playlistItem)}
            >
              <Edit2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </button>
            <button
              onClick={() => onDelete(playlistItem)}
              className="cursor-pointer p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
