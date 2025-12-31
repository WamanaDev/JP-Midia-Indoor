import { SubscriptionClient } from "@/components/dashboard/subscriptions/SubscriptionClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Buscar perfil com plano
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, plan:plans(*)")
    .eq("id", user.id)
    .single();

  // Buscar subscription ativa
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return <SubscriptionClient profile={profile} subscription={subscription} />;
}
