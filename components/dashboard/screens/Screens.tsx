"use client";

import { Screen as ScreenProps } from "@/interfaces/Screens";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { ScreenCard } from "./ScreenCard";
import { Client } from "@/interfaces/Clients";
import { Playlist } from "@/interfaces/Playlists";
import { ScreenForm } from "./ScreenForm";

interface Props {
  screens: ScreenProps[] | null;
  clients: Client[] | null;
  playlists: Playlist[] | null;
}

export function Screens({ screens, clients, playlists }: Props) {
  const [editingScreen, setEditingScreen] = useState<ScreenProps | null>(null);
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
            setEditingScreen(null);
            setShowForm(true);
          }}
          className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Cadastrar tela
        </button>
      </header>

      {showForm && (
        <ScreenForm
          screen={editingScreen ?? undefined}
          clients={clients}
          playlists={playlists}
          onCancel={() => setShowForm(false)}
        />
      )}

      {screens && screens.length === 0 ? (
        <div className="text-center p-12 border rounded-xl">
          <Users className="mx-auto w-12 h-12 text-gray-400" />
          <p className="mt-4 text-gray-500">Nenhum screene cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {screens &&
            screens.map((screen) => (
              <ScreenCard
                key={screen.id}
                screen={screen}
                onEdit={(screen) => {
                  setEditingScreen(screen);
                  setShowForm(true);
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
}
