"use client";

import { createContext, useContext, useState } from "react";
import { Playlist } from "@/interfaces/Playlists";

interface PlayerContextData {
  isOpen: boolean;
  playlist: Playlist | null;
  openPlayer: (playlist: Playlist) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextData | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);

  function openPlayer(playlist: Playlist) {
    setPlaylist(playlist);
    setIsOpen(true);
  }

  function closePlayer() {
    setIsOpen(false);
  }

  return (
    <PlayerContext.Provider
      value={{ isOpen, playlist, openPlayer, closePlayer }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
