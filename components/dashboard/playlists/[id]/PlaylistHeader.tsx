import { PlayerButtonClient } from "@/components/preview/PlayerButton";
import { Playlist } from "@/interfaces/Playlists";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function PlaylistHeader({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4 w-full">
        <Link
          href="/dashboard/playlists"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {playlist.name}
            </h1>

            {playlist.is_active ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                <CheckCircle className="w-3 h-3" />
                Ativa
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-full">
                <XCircle className="w-3 h-3" />
                Inativa
              </span>
            )}
          </div>

          {playlist.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {playlist.description}
            </p>
          )}
        </div>
        <div className="ml-auto">
          <PlayerButtonClient playlist={playlist} />
        </div>
      </div>
    </div>
  );
}
