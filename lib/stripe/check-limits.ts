import { createClient } from "@/utils/supabase/server";

export async function checkScreenLimit(userId: string): Promise<{
  canCreate: boolean;
  current: number;
  max: number | null;
  message?: string;
}> {
  const supabase = await createClient();

  // Buscar o plano do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_id, plans(max_screens)")
    .eq("id", userId)
    .single();

  if (!profile) {
    return {
      canCreate: false,
      current: 0,
      max: null,
      message: "Perfil não encontrado",
    };
  }

  const maxScreens = (profile.plans as any)?.max_screens;

  // Se for null (ilimitado), pode criar
  if (maxScreens === null) {
    return {
      canCreate: true,
      current: 0,
      max: null,
    };
  }

  // Contar telas ativas
  const { count } = await supabase
    .from("screens")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_active", true);

  const currentScreens = count || 0;

  return {
    canCreate: currentScreens < maxScreens,
    current: currentScreens,
    max: maxScreens,
    message:
      currentScreens >= maxScreens
        ? `Você atingiu o limite de ${maxScreens} telas do seu plano`
        : undefined,
  };
}

export async function checkStorageLimit(
  userId: string,
  fileSizeBytes: number
): Promise<{
  canUpload: boolean;
  currentUsage: number;
  maxStorage: number | null;
  message?: string;
}> {
  const supabase = await createClient();

  // Buscar o plano e uso atual
  const { data: profile } = await supabase
    .from("profiles")
    .select("bytes_usage, plan_id, plans(storage_gb)")
    .eq("id", userId)
    .single();

  if (!profile) {
    return {
      canUpload: false,
      currentUsage: 0,
      maxStorage: null,
      message: "Perfil não encontrado",
    };
  }

  const maxStorageGB = (profile.plans as any)?.storage_gb;

  // Se for null (ilimitado), pode fazer upload
  if (maxStorageGB === null) {
    return {
      canUpload: true,
      currentUsage: profile.bytes_usage,
      maxStorage: null,
    };
  }

  const maxStorageBytes = maxStorageGB * 1024 * 1024 * 1024; // GB para bytes
  const newUsage = profile.bytes_usage + fileSizeBytes;

  return {
    canUpload: newUsage <= maxStorageBytes,
    currentUsage: profile.bytes_usage,
    maxStorage: maxStorageBytes,
    message:
      newUsage > maxStorageBytes
        ? `Você atingiu o limite de ${maxStorageGB}GB do seu plano`
        : undefined,
  };
}
