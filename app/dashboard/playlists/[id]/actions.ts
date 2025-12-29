// app/dashboard/playlists/[id]/actions.ts
"use server";

import { PlaylistItemForm, PlaylistItems } from "@/interfaces/Playlists";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPlaylistItem(
  playlistId: string,
  data: PlaylistItemForm
) {
  const supabase = await createClient();

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

  const { error } = await supabase
    .from("playlist_items")
    .delete()
    .eq("id", playlistItem.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/playlists/${playlistItem.playlist_id}`);
}

export async function updatePlaylistItem(
  playlistItemId: string,
  data: PlaylistItemForm
) {
  const supabase = await createClient();

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

  revalidatePath(`/dashboard/playlists/${data.playlist_id}`);
}

export async function movePlaylistItemUp(playlistId: string, itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("move_playlist_item_up", {
    p_item_id: itemId,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/playlists/${playlistId}`);
}

export async function movePlaylistItemDown(playlistId: string, itemId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("move_playlist_item_down", {
    p_item_id: itemId,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/playlists/${playlistId}`);
}
