import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const supabase = await createClient();
  const { planId } = await params;

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/checkout/" + planId);
  }

  // Buscar informações do plano
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan) {
    redirect("/dashboard");
  }

  if (planError) {
    console.error("An unexpected error occurred:", planError);
  }

  // Buscar profile do usuário com o plano atual
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_id")
    .eq("id", user.id)
    .single();

  // Buscar nome do plano atual
  let currentPlanName: string | undefined;
  if (profile?.plan_id) {
    const { data: currentPlan } = await supabase
      .from("plans")
      .select("name")
      .eq("id", profile.plan_id)
      .single();

    currentPlanName = currentPlan?.name;
  }

  return <CheckoutClient plan={plan} currentPlanName={currentPlanName} />;
}
