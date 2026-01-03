import { createClient } from "@/utils/supabase/server";

export async function getUserSubscriptionStatus(userId: string) {
  const supabase = await createClient();

  // Buscar subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Buscar plano
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, plan:plans(*)")
    .eq("id", userId)
    .single();

  // Verificar se está ativo
  const isActive =
    !subscription || // Sem subscription = plano gratuito (Freemium)
    subscription.status === "active" ||
    subscription.status === "trialing";

  // Verificar se está com pagamento pendente
  const isPastDue = subscription?.status === "past_due";

  return {
    subscription,
    profile,
    plan: profile?.plan,
    isActive,
    isPastDue,
  };
}
