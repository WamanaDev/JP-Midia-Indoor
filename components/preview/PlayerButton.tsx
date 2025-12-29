"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Playlist } from "@/interfaces/Playlists";
import { Play } from "lucide-react";

interface PlayerButtonClientProps {
  playlist: Playlist;
}

export function PlayerButtonClient({ playlist }: PlayerButtonClientProps) {
  const { openPlayer } = usePlayer();

  return (
    <button
      onClick={() => openPlayer(playlist)}
      className="bg-green-600 hover:bg-green-800 transition-all p-1 rounded cursor-pointer"
    >
      <Play className="text-white" />
    </button>
  );
}
