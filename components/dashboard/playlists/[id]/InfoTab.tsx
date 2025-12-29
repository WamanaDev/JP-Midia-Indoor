// app/dashboard/playlists/[id]/components/InfoTab.tsx
import { Playlist } from "@/interfaces/Playlists";

export default function InfoTab({ playlist }: { playlist: Playlist }) {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Nome
        </label>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {playlist.name}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
          Descrição
        </label>
        <p className="text-gray-700 dark:text-gray-300">
          {playlist.description || "—"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Criada em</span>
          <p className="font-medium">
            {new Date(playlist.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div>
          <span className="text-gray-500">Última atualização</span>
          <p className="font-medium">
            {new Date(playlist.updated_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}
