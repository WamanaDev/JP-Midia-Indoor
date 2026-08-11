import { PaymentRequiredClient } from "@/components/dashboard/PaymentRequiredClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PaymentRequiredPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Buscar subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // REMOVER ESTA VERIFICAÇÃO QUE CAUSA O LOOP:
  // if (subscription?.status !== "past_due") {
  //   redirect("/dashboard");
  // }

  // Buscar profile com plano
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, plan:plans(*)")
    .eq("id", user.id)
    .single();

  // Buscar uso atual
  const { data: usage } = await supabase.rpc("get_user_usage", {
    p_user_id: user.id,
  });

  return (
    <PaymentRequiredClient
      subscription={subscription}
      profile={profile}
      usage={usage}
    />
  );
}
