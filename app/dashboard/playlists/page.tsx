import { Playlists } from "@/components/dashboard/playlists/Playlists";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "JP Mídia - Playlists",
};

export default async function PlaylistsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [
    { data: playlists, error: playlistsError },
    { data: clients, error: clientsError },
  ] = await Promise.all([
    supabase
      .from("playlists")
      .select(
        `
      *,
      playlist_items(id),
      screens(id, name)
    `
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("clients")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_active", true),
  ]);

  if (playlistsError) throw playlistsError;
  if (clientsError) throw clientsError;

  return (
    <span>
      <Playlists playlists={playlists} clients={clients} />
    </span>
  );
}
