"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteClientAction(id: string) {
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", id);
  revalidatePath("/dashboard/clients");
}

export async function toggleClientAction(id: string, isActive: boolean) {
  const supabase = await createClient();

  await supabase.from("clients").update({ is_active: !isActive }).eq("id", id);

  revalidatePath("/dashboard/clients");
}

export async function upsertClientAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const id = formData.get("id") as string | null;

  const payload = {
    name: formData.get("name"),
    company_name: formData.get("company_name"),
    cnpj: formData.get("cnpj"),
    is_active: formData.get("is_active") === "on",
    user_id: user.id,
  };

  if (id) {
    // EDITAR
    await supabase.from("clients").update(payload).eq("id", id);
  } else {
    // CRIAR
    await supabase.from("clients").insert(payload);
  }
  revalidatePath("/dashboard/clients");
}
