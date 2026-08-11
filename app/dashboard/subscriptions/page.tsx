import { SubscriptionClient } from "@/components/dashboard/subscriptions/SubscriptionClient";
import { stripe } from "@/lib/stripe";
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

  // Buscar perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, plan:plans(*)")
    .eq("id", user.id)
    .single();

  // Buscar subscription
  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (subscriptionError) {
    console.error("❌ Erro ao buscar subscription:", subscriptionError);
  }

  // ✅ Sincronizar automaticamente com o Stripe
  if (subscription?.stripe_subscription_id) {
    try {
      const stripeSubscriptionResponse = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );
      const stripeSubscription = stripeSubscriptionResponse as any;

      // Verificar se o status está diferente
      if (stripeSubscription.status !== subscription.status) {
        console.log("🔄 Sincronizando status da subscription...");
        console.log("- Status no banco:", subscription.status);
        console.log("- Status no Stripe:", stripeSubscription.status);

        // Atualizar banco com dados do Stripe
        // current_period_end vive no item da subscription, não na subscription
        // em si, nesta versão da API do Stripe.
        const itemPeriodEnd =
          stripeSubscription.items?.data?.[0]?.current_period_end;
        const currentPeriodEnd = itemPeriodEnd
          ? new Date(itemPeriodEnd * 1000).toISOString()
          : null;

        await supabase
          .from("subscriptions")
          .update({
            status: stripeSubscription.status,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end:
              stripeSubscription.cancel_at_period_end || false,
          })
          .eq("id", subscription.id);

        console.log("✅ Subscription sincronizada automaticamente!");

        // Atualizar a variável local
        subscription.status = stripeSubscription.status;
        subscription.current_period_end = currentPeriodEnd;
        subscription.cancel_at_period_end =
          stripeSubscription.cancel_at_period_end || false;
      }
    } catch (error) {
      console.error("❌ Erro ao sincronizar subscription:", error);
      // Não bloquear a página se a sincronização falhar
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <SubscriptionClient profile={profile} subscription={subscription} />
    </div>
  );
}
