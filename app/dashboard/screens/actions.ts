"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteScreenAction(id: string) {
  const supabase = await createClient();
  await supabase.from("screens").delete().eq("id", id);
  revalidatePath("/dashboard/screens");
}

export async function toggleScreenAction(id: string, isActive: boolean) {
  const supabase = await createClient();

  await supabase.from("screens").update({ is_active: !isActive }).eq("id", id);

  revalidatePath("/dashboard/screens");
}

export async function checkDeviceCode(code: string) {
  const supabase = await createClient();

  // 1️⃣ Verificar se o dispositivo existe
  const { data, error } = await supabase
    .from("new_device")
    .select("*")
    .eq("device_code", code)
    .single();

  if (error || !data) {
    throw new Error("Dispositivo não encontrado");
  }

  // 2️⃣ Enviar mensagem para o dispositivo via canal usando httpSend
  const channel = supabase.channel(`device-link-${code}`);

  // envia a mensagem via REST
  await channel.httpSend(
    "device_status", // nome do evento
    {
      status: "configuring",
      message: "Dispositivo em configuração...",
      timestamp: Date.now(),
    }
  );
  return { success: true };
}

export async function upsertScreenAction(formData: FormData) {
  const supabase = await createClient();

  // 1️⃣ Obter usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // 2️⃣ Preparar payload para insert/update
  const id = formData.get("id") as string | null;
  const payload = {
    name: formData.get("name"),
    client_id: formData.get("client_id"),
    location: formData.get("location"),
    playlist_id: formData.get("playlist_id"),
    is_active: formData.get("is_active") === "on",
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  let screenId = id;

  try {
    // 3️⃣ Inserir ou atualizar screen
    if (id) {
      await supabase.from("screens").update(payload).eq("id", id);
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: `Screen "${payload.name}" atualizada`,
      });
    } else {
      const { data, error } = await supabase
        .from("screens")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42501") {
          alert("Limite de dispositivos atingido para seu plano atual.");
          return;
        } else {
          console.error("Erro ao criar dispositivo:", error);
          alert("Erro ao criar dispositivo: " + error.message);
          return;
        }
      }

      screenId = data.id;
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        action: `Screen "${payload.name}" vinculada`,
      });
    }

    // 4️⃣ Obter JWT do usuário logado
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      console.error("Usuário não logado");
      return;
    }
    const userJwt = sessionData.session.access_token;

    // 5️⃣ Chamar Edge Function para gerar JWT do dispositivo
    const { data: tokenRes, error: tokenErr } = await supabase.functions.invoke(
      "generate-device-jwt",
      {
        body: { device_id: screenId, user_id: user.id },
        headers: { Authorization: `Bearer ${userJwt}` },
      }
    );

    console.log("tokenRes", tokenRes);

    if (tokenErr) throw tokenErr;
    if (!tokenRes?.jwt) throw new Error("JWT do dispositivo não recebido");

    const deviceJwt = tokenRes.jwt;
    console.log("JWT do dispositivo gerado:", deviceJwt);

    // 6️⃣ Enviar JWT para a TV
    const code = formData.get("code") as string; // ou outro campo identificador da TV
    // 2️⃣ Enviar mensagem para o dispositivo via canal
    console.log("code", code);
    await supabase.channel(`device-link-${code}`).httpSend(
      "token", // nome do evento
      { jwt: deviceJwt } // payload
    );

    console.log("📡 JWT enviado para a TV!");

    // 7️⃣ Revalidar rota se necessário
    revalidatePath("/dashboard/screens");
  } catch (err) {
    console.error("Erro no processo:", err);
    throw err;
  }
}
