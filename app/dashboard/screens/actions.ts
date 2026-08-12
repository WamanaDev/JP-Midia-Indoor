"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteScreenAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  await supabase.from("screens").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard/screens");
}

export async function toggleScreenAction(id: string, isActive: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  await supabase
    .from("screens")
    .update({ is_active: !isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/screens");
}

export type CheckDeviceCodeResult =
  | { success: true }
  | { success: false; error: string };

export async function checkDeviceCode(
  code: string
): Promise<CheckDeviceCodeResult> {
  const supabase = await createClient();

  // 1️⃣ Verificar se o dispositivo existe
  const { data, error } = await supabase
    .from("new_device")
    .select("*")
    .eq("device_code", code)
    .single();

  if (error || !data) {
    return {
      success: false,
      error: "Código não encontrado. Verifique e tente novamente.",
    };
  }

  // 2️⃣ Enviar mensagem para o dispositivo via canal usando httpSend
  try {
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
  } catch (err) {
    console.error("Erro ao notificar dispositivo:", err);
    return {
      success: false,
      error: "Não foi possível conectar ao dispositivo. Tente novamente.",
    };
  }

  return { success: true };
}

export type UpsertScreenState = { error: string | null };

export async function upsertScreenAction(
  _prevState: UpsertScreenState,
  formData: FormData
): Promise<UpsertScreenState> {
  const supabase = await createClient();

  // 1️⃣ Obter usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Usuário não autenticado" };

  // 2️⃣ Preparar payload para insert/update
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string | null;
  const clientId = formData.get("client_id") as string | null;
  const location = formData.get("location") as string | null;
  const playlistId = formData.get("playlist_id") as string | null;

  if (!name?.trim() || !clientId || !location?.trim() || !playlistId) {
    return { error: "Preencha nome, cliente, localização e playlist." };
  }

  const payload = {
    name,
    client_id: clientId,
    location,
    playlist_id: playlistId,
    is_active: formData.get("is_active") === "on",
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  let screenId = id;

  try {
    // 3️⃣ Inserir ou atualizar screen
    if (id) {
      await supabase
        .from("screens")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id);
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
          return {
            error: "Limite de telas atingido para seu plano atual.",
          };
        } else {
          console.error("Erro ao criar dispositivo:", error);
          return { error: "Erro ao criar dispositivo: " + error.message };
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
      return { error: "Sessão expirada. Faça login novamente." };
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

    if (tokenErr) {
      // O erro do SDK ("Edge Function returned a non-2xx status code") é
      // genérico — o corpo de verdade da resposta vem em tokenErr.context.
      let detail = tokenErr.message;
      if (tokenErr.context && typeof tokenErr.context.text === "function") {
        try {
          detail = await tokenErr.context.clone().text();
        } catch {
          // mantém a mensagem genérica se não der pra ler o corpo
        }
      }
      console.error("❌ generate-device-jwt falhou:", detail);
      return { error: `Erro ao gerar credenciais do dispositivo: ${detail}` };
    }
    if (!tokenRes?.jwt) {
      return { error: "JWT do dispositivo não recebido" };
    }

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
    return { error: null };
  } catch (err) {
    console.error("Erro no processo:", err);
    return {
      error: err instanceof Error ? err.message : "Erro ao processar dispositivo",
    };
  }
}
