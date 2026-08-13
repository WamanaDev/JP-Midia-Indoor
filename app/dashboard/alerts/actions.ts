"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type SendAlertState = { error: string | null; success?: boolean };

export async function sendAlertAction(
  _prevState: SendAlertState,
  formData: FormData
): Promise<SendAlertState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Usuário não autenticado" };

  const message = (formData.get("message") as string | null)?.trim();
  const durationMinutes = Number(formData.get("duration"));
  const screenIds = formData.getAll("screen_ids") as string[];

  if (!message) return { error: "Escreva a mensagem do alerta." };
  if (!screenIds.length) return { error: "Escolha pelo menos uma tela." };
  if (!durationMinutes || durationMinutes <= 0) {
    return { error: "Escolha por quanto tempo o alerta deve ficar na tela." };
  }

  const batchId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + durationMinutes * 60_000).toISOString();

  const rows = screenIds.map((screen_id) => ({
    batch_id: batchId,
    user_id: user.id,
    screen_id,
    message,
    expires_at: expiresAt,
  }));

  const { error } = await supabase.from("emergency_alerts").insert(rows);

  if (error) {
    console.error("Erro ao enviar alerta:", error);
    return { error: "Erro ao enviar alerta: " + error.message };
  }

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: `Alerta de emergência enviado para ${screenIds.length} tela(s)`,
  });

  revalidatePath("/dashboard/alerts");
  return { error: null, success: true };
}

export async function dismissAlertAction(batchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  await supabase
    .from("emergency_alerts")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("batch_id", batchId)
    .eq("user_id", user.id);

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "Alerta de emergência encerrado manualmente",
  });

  revalidatePath("/dashboard/alerts");
}
