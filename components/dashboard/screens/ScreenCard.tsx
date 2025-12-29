import {
  deleteScreenAction,
  toggleScreenAction,
} from "@/app/dashboard/screens/actions";
import { Screen } from "@/interfaces/Screens";
import { CheckCircle, XCircle, Edit2, Trash2 } from "lucide-react";

interface Props {
  screen: Screen;
  onEdit: (client: Screen) => void;
}

export function ScreenCard({ screen, onEdit }: Props) {
  return (
    <div
      key={screen.id}
      className="  bg-white dark:bg-[#1F2937]
  rounded-xl
  border border-gray-200 dark:border-gray-700
  p-6
  transition-all
  shadow-sm hover:shadow-lg
  dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]
  dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-[#111827] dark:text-white">
              {screen.name}
            </h3>
            {screen.is_active ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                <CheckCircle className="w-3 h-3" />
                Ativa
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-full">
                <XCircle className="w-3 h-3" />
                Inativa
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Localização: {screen.location}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Playlist: {screen.playlist?.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {screen.updated_at ? (
              <>
                Última atualização em{" "}
                {new Date(screen.updated_at).toLocaleDateString("pt-BR")}
              </>
            ) : (
              <>
                Criado em{" "}
                {new Date(screen.created_at).toLocaleDateString("pt-BR")}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={() => toggleScreenAction(screen.id, screen.is_active)}>
            <button
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded-lg transition-colors"
              title={screen.is_active ? "Desativar" : "Ativar"}
            >
              {screen.is_active ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5text-gray-400" />
              )}
            </button>
          </form>
          <button
            onClick={() => onEdit(screen)}
            className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-5 h-5 text-[#3B82F6]" />
          </button>
          <form action={() => deleteScreenAction(screen.id)}>
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
  );
}
