import { Metadata } from "next";
import { PricingClient } from "@/components/pricing/PricingClient";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Planos e Preços",
  description:
    "Compare os planos da JP Mídia Indoor: comece grátis, sem cartão de crédito, e evolua conforme seu negócio cresce. 7 dias de garantia incondicional em qualquer plano pago.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    url: "/pricing",
    title: "Planos e Preços | JP Mídia Indoor",
    description:
      "Compare os planos da JP Mídia Indoor: comece grátis, sem cartão de crédito, e evolua conforme seu negócio cresce.",
  },
};

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
