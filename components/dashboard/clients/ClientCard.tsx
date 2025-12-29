"use client";

import { Client } from "@/interfaces/Clients";
import { CheckCircle, XCircle, Edit2, Trash2 } from "lucide-react";
import {
  toggleClientAction,
  deleteClientAction,
} from "@/app/dashboard/clients/actions";

interface Props {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: Props) {
  return (
    <div
      key={client.id}
      className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-[#111827] dark:text-white">
              {client.name}
            </h3>
            {client.is_active ? (
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
            Companhia: {client.company_name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            CNPJ: {client.cnpj}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Criado em {new Date(client.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form action={() => toggleClientAction(client.id, client.is_active)}>
            <button
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={client.is_active ? "Desativar" : "Ativar"}
            >
              {client.is_active ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5text-gray-400" />
              )}
            </button>
          </form>
          <button
            onClick={() => onEdit(client)}
            className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-5 h-5 text-[#3B82F6]" />
          </button>
          <form action={() => deleteClientAction(client.id)}>
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
