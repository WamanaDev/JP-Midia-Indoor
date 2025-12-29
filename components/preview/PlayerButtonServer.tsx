// components/preview/PlayerButtonServer.tsx
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PlayerButtonClient } from "./PlayerButton";

interface PlayerButtonProps {
  playlistId: string;
}

export async function PlayerButtonServer({ playlistId }: PlayerButtonProps) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { data: playlist } = await supabase
    .from("playlists")
    .select(
      `
      *,
      playlist_items (
        *,
        media_files (
          id,
          storage_path,
          mime_type
        )
      )
    `
    )
    .eq("id", playlistId)
    .single();

  if (!playlist) {
    notFound();
  }

  return <PlayerButtonClient playlist={playlist} />;
}
