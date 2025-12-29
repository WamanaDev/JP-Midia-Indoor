import Editor from "@/components/dashboard/playlists/[id]/Editor";
import { ResourceNotFound } from "@/components/dashboard/ResourceNotFound";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function PlaylistEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 👈 OBRIGATÓRIO

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    notFound();
  }

  const { data: playlist, error } = await supabase
    .from("playlists")
    .select(
      `
    *,
    playlist_items (
      *,
      media_files!playlist_items_media_file_id_fkey (
        id,
        original_name,
        mime_type,
        storage_path,
        size_bytes,
        thumbnail_path
      )
    )
  `
    )
    .eq("id", id)
    .order("order_index", { foreignTable: "playlist_items", ascending: true })
    .single();

  if (error || !playlist) {
    return (
      <ResourceNotFound
        title="Playlist não encontrada"
        description="Essa playlist não existe ou foi removida."
        backHref="/dashboard/playlists"
        backLabel="Voltar para playlists"
      />
    );
  }

  const { data: images } = await supabase
    .from("media_files")
    .select("*")
    .eq("user_id", user.id)
    .ilike("mime_type", "image/%")
    .order("created_at", { ascending: false });

  const { data: videos } = await supabase
    .from("media_files")
    .select("*")
    .eq("user_id", user.id)
    .ilike("mime_type", "video/%")
    .order("created_at", { ascending: false });

  return <Editor playlist={playlist} images={images} videos={videos} />;
}
