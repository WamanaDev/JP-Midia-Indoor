// app/dashboard/playlists/[id]/actions.ts
"use server";

import { PlaylistItemForm, PlaylistItems } from "@/interfaces/Playlists";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function getAuthedUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  return user;
}

// playlist_items has no user_id of its own — ownership is indirect via
// its parent playlist, so every mutation here has to check that instead.
async function assertOwnsPlaylist(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  playlistId: string
) {
  const { data } = await supabase
    .from("playlists")
    .select("id")
    .eq("id", playlistId)
    .eq("user_id", userId)
    .single();

  if (!data) throw new Error("Permissão negada");
}

export async function createPlaylistItem(
  playlistId: string,
  data: PlaylistItemForm
) {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);
  await assertOwnsPlaylist(supabase, user.id, playlistId);

  const { error } = await supabase.from("playlist_items").insert({
    playlist_id: playlistId,
    type: data.type,
    media_file_id: data.media_file_id,
    order_index: data.order_index,
    duration_override: data.duration_override,
    start_view: data.start_view,
    end_view: data.end_view,
    config: data.config,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/playlists/${playlistId}`);
}

export async function deletePlaylistItem(playlistItem: PlaylistItems) {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);

  const { data: item } = await supabase
    .from("playlist_items")
    .select("playlist_id")
    .eq("id", playlistItem.id)
    .single();
  if (!item) throw new Error("Item não encontrado");

  await assertOwnsPlaylist(supabase, user.id, item.playlist_id);

  const { error } = await supabase
    .from("playlist_items")
    .delete()
    .eq("id", playlistItem.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/playlists/${item.playlist_id}`);
}

export async function updatePlaylistItem(
  playlistItemId: string,
  data: PlaylistItemForm
) {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);

  const { data: item } = await supabase
    .from("playlist_items")
    .select("playlist_id")
    .eq("id", playlistItemId)
    .single();
  if (!item) throw new Error("Item não encontrado");

  await assertOwnsPlaylist(supabase, user.id, item.playlist_id);

  const { error } = await supabase
    .from("playlist_items")
    .update({
      type: data.type,
      media_file_id: data.media_file_id,
      order_index: data.order_index,
      duration_override: data.duration_override,
      start_view: data.start_view,
      end_view: data.end_view,
      config: data.config,
    })
    .eq("id", playlistItemId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/playlists/${item.playlist_id}`);
}

export async function movePlaylistItemUp(playlistId: string, itemId: string) {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);
  await assertOwnsPlaylist(supabase, user.id, playlistId);

  const { error } = await supabase.rpc("move_playlist_item_up", {
    p_item_id: itemId,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/playlists/${playlistId}`);
}

export async function movePlaylistItemDown(playlistId: string, itemId: string) {
  const supabase = await createClient();
  const user = await getAuthedUser(supabase);
  await assertOwnsPlaylist(supabase, user.id, playlistId);

  const { error } = await supabase.rpc("move_playlist_item_down", {
    p_item_id: itemId,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/playlists/${playlistId}`);
}
