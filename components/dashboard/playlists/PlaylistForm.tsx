import { upsertPlaylistAction } from "@/app/dashboard/playlists/actions";
import { Client } from "@/interfaces/Clients";
import { Playlist } from "@/interfaces/Playlists";

interface Props {
  playlist?: Playlist;
  clients: Client[] | null;
  onCancel?: () => void;
}

export function PlaylistForm({ playlist, clients, onCancel }: Props) {
  const isEditing = Boolean(playlist?.id);
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-6">
        {isEditing ? "Editar Cliente" : "Novo Cliente"}
      </h3>

      <form action={upsertPlaylistAction} className="space-y-4">
        {/* ID oculto para edição */}
        {isEditing && <input type="hidden" name="id" value={playlist!.id} />}

        <div>
          <label className="block text-sm font-medium mb-2">Nome</label>
          <input
            name="name"
            defaultValue={playlist?.name ?? ""}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
            placeholder="Nome da Playlist"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descrição</label>
          <textarea
            name="description"
            defaultValue={playlist?.description ?? ""}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
            placeholder="Breve descrição"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cliente</label>
          <select
            name="client_id"
            defaultValue={playlist?.client_id ?? ""}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            {!clients || clients.length === 0 ? (
              <option>Cadastre um cliente antes</option>
            ) : (
              <>
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                    selected={playlist && client.id === playlist.client_id}
                  >
                    {client.name} — {client.company_name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={playlist?.is_active ?? true}
            className="w-5 h-5"
          />
          <label className="text-sm font-medium">Ativar playlist</label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="cursor-pointer px-6 py-2 bg-[#3B82F6] text-white font-semibold rounded-lg hover:bg-[#1E3A8A] transition-colors"
          >
            {isEditing ? "Atualizar" : "Criar"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
