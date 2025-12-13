"use client";

import { useState } from "react";
import { ClientCard } from "./ClientCard";
import { Plus, Users } from "lucide-react";
import { Client } from "@/interfaces/clients";
import { FormClient } from "./FormClient";

interface Props {
  clients: Client[] | null;
}

export function Clients({ clients }: Props) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Clientes</h2>
          <p className="text-gray-500">Gerencie seus clientes</p>
        </div>

        <button
          onClick={() => {
            setEditingClient(null);
            setShowForm(true);
          }}
          className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </header>

      {showForm && (
        <FormClient
          client={editingClient ?? undefined}
          onCancel={() => setShowForm(false)}
        />
      )}

      {clients && clients.length === 0 ? (
        <div className="text-center p-12 border rounded-xl">
          <Users className="mx-auto w-12 h-12 text-gray-400" />
          <p className="mt-4 text-gray-500">Nenhum cliente cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients &&
            clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={(client) => {
                  setEditingClient(client);
                  setShowForm(true);
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
}
