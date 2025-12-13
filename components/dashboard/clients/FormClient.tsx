"use client";

import { upsertClientAction } from "@/app/dashboard/clients/actions";

interface Client {
  id?: string;
  name: string;
  company_name: string;
  cnpj: string;
  is_active: boolean;
}

interface FormClientProps {
  client?: Client; // se existir → edição
  onCancel?: () => void;
}

export function FormClient({ client, onCancel }: FormClientProps) {
  const isEditing = Boolean(client?.id);

  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-6">
        {isEditing ? "Editar Cliente" : "Novo Cliente"}
      </h3>

      <form action={upsertClientAction} className="space-y-4">
        {/* ID oculto para edição */}
        {isEditing && <input type="hidden" name="id" value={client!.id} />}

        <div>
          <label className="block text-sm font-medium mb-2">Nome</label>
          <input
            name="name"
            defaultValue={client?.name ?? ""}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Companhia</label>
          <input
            name="company_name"
            defaultValue={client?.company_name ?? ""}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CNPJ</label>
          <input
            name="cnpj"
            defaultValue={client?.cnpj ?? ""}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none bg-white dark:bg-gray-800 text-[#111827] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={client?.is_active ?? true}
            className="w-5 h-5"
          />
          <label className="text-sm font-medium">Ativar cliente</label>
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
