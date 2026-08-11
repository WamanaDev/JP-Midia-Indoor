import { createClient } from "@/utils/supabase/server";

export async function checkSubscriptionAccess(userId: string) {
  const supabase = await createClient();

  // Buscar subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Buscar perfil com plano
  const { data: profile } = await supabase
    .from("profiles")
    .select("bytes_usage, plan_id, plans(*)")
    .eq("id", userId)
    .single();

  const plan = profile?.plans as any;

  // Verificar se pagamento está pendente
  const isPastDue = subscription?.status === "past_due";

  // Verificar limites
  const { count: screensCount } = await supabase
    .from("screens")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const storageUsedBytes = profile?.bytes_usage || 0;
  const storageUsedGb = storageUsedBytes / (1024 * 1024 * 1024);

  const maxScreens = plan?.max_screens || 1;
  const maxStorageGb = plan?.storage_gb || 1;

  const exceededScreens =
    maxScreens !== null && (screensCount || 0) > maxScreens;
  const exceededStorage = maxStorageGb !== null && storageUsedGb > maxStorageGb;

  return {
    isPastDue,
    exceededScreens,
    exceededStorage,
    canAccess: !isPastDue && !exceededScreens && !exceededStorage,
    currentScreens: screensCount || 0,
    maxScreens,
    // Sem arredondar aqui: quem exibe decide a precisão (ex: MB para uso
    // pequeno). Arredondar pra 2 casas antes de devolver zerava usos < 10MB.
    currentStorageGb: storageUsedGb,
    maxStorageGb,
    message: isPastDue
      ? "Pagamento pendente. Por favor, regularize sua assinatura para continuar acessando este recurso."
      : exceededScreens
      ? `Você excedeu o limite de ${maxScreens} telas. Faça upgrade do seu plano ou remova telas existentes.`
      : exceededStorage
      ? `Você excedeu o limite de ${maxStorageGb} GB de armazenamento. Faça upgrade do seu plano ou remova mídias.`
      : null,
  };
}
