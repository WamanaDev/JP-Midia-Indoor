"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

import { uploadFileToR2, deleteFileFromR2 } from "@/lib/media/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function uploadMediaAction(formData: FormData) {
  const supabase = await createClient();

  // 🔐 Usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  // 📄 Arquivo principal
  const file = formData.get("file") as File;
  if (!file) throw new Error("Arquivo não enviado");

  // 🖼️ Thumbnail (vem do client, opcional)
  const thumbnail = formData.get("thumbnail") as File | null;

  const MAX_SIZE_BYTES = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Arquivo muito grande (máx. 50MB)");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      "Tipo de arquivo não suportado. Envie uma imagem (JPEG, PNG, WEBP, GIF) ou vídeo (MP4, WEBM, MOV)."
    );
  }

  // 🗂️ Key única no R2
  const key = `${user.id}/${crypto.randomUUID()}-${file.name}`;
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  const thumbKey = thumbnail ? `thumbs/${key}.jpg` : null;

  // 📁 Arquivos temporários
  const tempFilePath = path.join(os.tmpdir(), key.replace(/\//g, "_"));
  const tempThumbPath = thumbnail ? `${tempFilePath}-thumb.jpg` : null;

  // 💾 Salvar arquivo principal
  fs.writeFileSync(tempFilePath, Buffer.from(await file.arrayBuffer()));

  // 💾 Salvar thumbnail (se existir)
  if (thumbnail && tempThumbPath) {
    fs.writeFileSync(tempThumbPath, Buffer.from(await thumbnail.arrayBuffer()));
  }

  try {
    // ☁️ Upload do arquivo principal
    await uploadFileToR2(tempFilePath, key, file.type);

    // ☁️ Upload da thumbnail
    let thumbnailUrl: string | null = null;

    if (thumbnail && tempThumbPath && thumbKey) {
      await uploadFileToR2(tempThumbPath, thumbKey, "image/jpeg");
      thumbnailUrl = `${process.env.R2_PUBLIC_URL}/${thumbKey}`;
    }

    // 🗄️ Registrar no banco
    const { error } = await supabase.from("media_files").insert({
      user_id: user.id,
      filename: key,
      original_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: publicUrl,
      thumbnail_path: thumbnailUrl,
    });

    if (error) throw error;

    // 🔄 Revalidar rota
    revalidatePath("/dashboard/medias");

    return {
      success: true,
      publicUrl,
      thumbnailUrl,
    };
  } finally {
    // 🧹 Limpeza garantida
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (tempThumbPath && fs.existsSync(tempThumbPath)) {
      fs.unlinkSync(tempThumbPath);
    }
  }
}

export async function deleteMediaAction(key: string, id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Usuário não autenticado");

  const { data: media, error } = await supabase
    .from("media_files")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (error || !media) throw new Error("Arquivo não encontrado");
  if (media.user_id !== user.id) throw new Error("Permissão negada");

  // ☁️ Remover do R2
  await deleteFileFromR2(key);
  await deleteFileFromR2(`thumbs/${key}.jpg`).catch(() => {});

  // 🗑️ Remover do banco
  await supabase
    .from("media_files")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  // 🔄 Revalidar rota
  revalidatePath("/dashboard/medias");

  return { success: true };
}
