"use client";

import { upsertClientAction } from "@/app/dashboard/clients/actions";
import { formatCnpj } from "@/lib/format/cnpj";
import { AlertCircle } from "lucide-react";
import { useActionState, useState } from "react";

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
  const [state, formAction, isPending] = useActionState(upsertClientAction, {
    error: null,
  });
  const [cnpj, setCnpj] = useState(() => formatCnpj(client?.cnpj ?? ""));

  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-6">
        {isEditing ? "Editar Cliente" : "Novo Cliente"}
      </h3>

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">
            {state.error}
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
            value={cnpj}
            onChange={(e) => setCnpj(formatCnpj(e.target.value))}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
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
            disabled={isPending}
            className="cursor-pointer px-6 py-2 bg-[#3B82F6] text-white font-semibold rounded-lg hover:bg-[#1E3A8A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
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
