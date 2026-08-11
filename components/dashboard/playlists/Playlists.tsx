"use client";

import { Playlist } from "@/interfaces/Playlists";
import { Play, Plus } from "lucide-react";
import { PlaylistCard } from "./PlaylistCard";
import { useState } from "react";
import { PlaylistForm } from "./PlaylistForm";
import { Client } from "@/interfaces/Clients";
import { UsageBadge } from "@/components/dashboard/UsageBadge";

interface Props {
  playlists: Playlist[] | null;
  clients: Client[] | null;
  onCancel?: () => void;
}

export function Playlists({ playlists, clients }: Props) {
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [showForm, setShowForm] = useState(false);
  const playlistsCount = playlists?.length ?? 0;
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Playlists</h2>
          <p className="text-gray-500">Gerencie suas playlists</p>
        </div>

        <button
          onClick={() => {
            setEditingPlaylist(null);
            setShowForm(true);
          }}
          className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Criar Playlist
        </button>
      </header>

      <UsageBadge label="Playlists" current={playlistsCount} />

      {showForm && (
        <PlaylistForm
          playlist={editingPlaylist ?? undefined}
          clients={clients}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!playlists || playlists.length === 0 ? (
        <div className="text-center p-12 border rounded-xl">
          <Play className="mx-auto w-12 h-12 text-gray-400" />
          <p className="mt-4 text-gray-500">Nenhuma playlist cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {playlists &&
            playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onEdit={(playlist) => {
                  setEditingPlaylist(playlist);
                  setShowForm(true);
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
}
