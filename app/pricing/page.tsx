import { PricingClient } from "@/components/pricing/PricingClient";
import { createClient } from "@/utils/supabase/server";

export default async function PricingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Buscar todos os planos
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price", { ascending: true });

  // Se usuário está logado, buscar o plano atual
  let currentPlanId: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_id")
      .eq("id", user.id)
      .single();

    currentPlanId = profile?.plan_id || null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PricingClient
        plans={plans || []}
        currentPlanId={currentPlanId}
        isAuthenticated={!!user}
      />
    </div>
  );
}
