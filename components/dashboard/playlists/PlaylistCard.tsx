import {
  deletePlaylistAction,
  togglePlaylistAction,
} from "@/app/dashboard/playlists/actions";
import { PlayerButtonClient } from "@/components/preview/PlayerButton";
import { Playlist } from "@/interfaces/Playlists";
import {
  CheckCircle,
  XCircle,
  Pause,
  Play,
  ListChecks,
  Edit2,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface Props {
  playlist: Playlist;
  onEdit: (playlist: Playlist) => void;
}

export function PlaylistCard({ playlist, onEdit }: Props) {
  const playlistsWithCount = playlist.playlist_items.length;
  return (
    <>
      <div
        key={playlist.id}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
      >
        {/* Header */}
        <div className="md:flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Nome e status */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                {playlist.name}
              </h3>
              <div className="bg-blue-100 dark:bg-blue-900/40 rounded-2xl px-2 py-1 text-xs font-bold">
                {new Date(playlist.created_at).toLocaleDateString("pt-BR")}
              </div>
              {playlist.is_active ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Ativa
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                  <XCircle className="w-3 h-3" />
                  Inativa
                </span>
              )}
              <PlayerButtonClient playlist={playlist} />
            </div>

            {/* Descrição */}
            {playlist.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-xs">
                <span className="font-bold">Descrição:</span>{" "}
                {playlist.description}
              </p>
            )}

            {/* Informações adicionais */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-900 dark:text-white">
              <span className="py-1 rounded-2xl">
                <span className="bg-sky-200 dark:bg-sky-900/80 rounded-l-full px-2 py-1 font-bold">
                  Mídias:
                </span>
                <span className="bg-sky-100 dark:bg-sky-900/40 rounded-r-full px-2 py-1">
                  {playlistsWithCount !== 1
                    ? `${playlistsWithCount} itens`
                    : `${playlistsWithCount} item`}
                </span>
              </span>
              {playlist.screens?.length > 0 && (
                <span className="py-1 rounded-2xl">
                  <span className="bg-pink-200 dark:bg-pink-900/80 rounded-l-full px-2 py-1 font-bold">
                    Telas:
                  </span>
                  <span className="bg-pink-100 dark:bg-pink-900/40 rounded-r-full px-2 py-1">
                    {playlist.screens.length} tela
                    {playlist.screens.length !== 1 ? "s" : ""}
                  </span>
                </span>
              )}
            </div>

            {/* Lista de screens vinculadas */}
            {playlist.screens?.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-900/40 p-2 mt-2 rounded">
                <span className="text-xs font-bold">Dispositivos:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {playlist.screens.map((screen) => (
                    <span
                      key={screen.id}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-2 py-1 text-xs rounded-full"
                    >
                      {screen.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="bg-gray-900/40 md:bg-gray-900/0 mt-2 md:mt-0 rounded justify-between px-5 md:px-0 flex flex-row md:flex-col items-center gap-2 shrink-0">
            <form
              action={() =>
                togglePlaylistAction(playlist.id, playlist.is_active)
              }
            >
              <button
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={playlist.is_active ? "Desativar" : "Ativar"}
              >
                {playlist.is_active ? (
                  <Pause className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </button>
            </form>
            <Link
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Gerenciar Itens"
              href={`playlists/${playlist.id}`}
            >
              <ListChecks className="w-5 h-5 text-yellow-500" />
            </Link>

            <button
              onClick={() => onEdit(playlist)}
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </button>
            <form
              action={() => deletePlaylistAction(playlist.id)}
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Tem certeza que deseja excluir a playlist "${playlist.name}"? Essa ação não pode ser desfeita.`
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <button
                className="cursor-pointer p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
