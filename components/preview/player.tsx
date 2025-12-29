"use client";

import { usePlayer } from "@/context/PlayerContext";
import { X } from "lucide-react";
import { PlayerCore } from "./PlayerCore";

export function PlayerOverlay() {
  const { isOpen, playlist, closePlayer } = usePlayer();

  if (!isOpen || !playlist) return null;

  return (
    <div className="fixed inset-0 z-9990 bg-black text-white">
      <div className="bg-black/90 w-full h-20 fixed inset-0 z-99">
        <div className="flex items-center justify-between p-5">
          <div className="font-bold text-4xl">{playlist.name}</div>
          <button
            onClick={closePlayer}
            className="bg-white text-black p-2 rounded-full z-99999 cursor-pointer"
          >
            <X />
          </button>
        </div>
      </div>
      <PlayerCore playlistId={playlist.id} />
    </div>
  );
}
