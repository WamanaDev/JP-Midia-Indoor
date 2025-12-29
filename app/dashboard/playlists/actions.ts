"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Excluir playlist
 */
export async function deletePlaylistAction(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  await supabase.from("playlists").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/dashboard/playlists");
}

/**
 * Ativar / Desativar playlist
 */
export async function togglePlaylistAction(id: string, isActive: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  await supabase
    .from("playlists")
    .update({ is_active: !isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/playlists");
}

/**
 * Criar ou atualizar playlist
 */
export async function upsertPlaylistAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const id = formData.get("id") as string | null;

  const payload = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    client_id: formData.get("client_id") as string,
    is_active: formData.get("is_active") === "on",
    user_id: user.id,
  };

  if (id) {
    // EDITAR
    await supabase
      .from("playlists")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id);
  } else {
    // CRIAR
    await supabase.from("playlists").insert(payload);
  }

  revalidatePath("/dashboard/playlists");
}
