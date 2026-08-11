import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar subscription no banco
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, stripe_subscription_id, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Subscription não encontrada" },
        { status: 404 }
      );
    }

    console.log("📊 Subscription no banco:", subscription);

    // ✅ Buscar status real no Stripe e fazer cast para any
    const stripeSubscriptionResponse = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );
    const stripeSubscription = stripeSubscriptionResponse as any;

    // current_period_end vive no item da subscription, não na subscription
    // em si, nesta versão da API do Stripe.
    const itemPeriodEnd =
      stripeSubscription.items?.data?.[0]?.current_period_end;

    console.log("📊 Subscription no Stripe:", {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      current_period_end: itemPeriodEnd,
    });

    // Atualizar banco com dados do Stripe
    const currentPeriodEnd = itemPeriodEnd
      ? new Date(itemPeriodEnd * 1000).toISOString()
      : null;

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: stripeSubscription.status,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
      })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("❌ Erro ao atualizar:", updateError);
      return NextResponse.json(
        { error: "Erro ao atualizar subscription" },
        { status: 500 }
      );
    }

    console.log("✅ Subscription sincronizada com sucesso!");

    return NextResponse.json({
      success: true,
      message: "Subscription sincronizada com sucesso",
      old_status: subscription.status,
      new_status: stripeSubscription.status,
    });
  } catch (error: any) {
    console.error("❌ Erro ao sincronizar:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao sincronizar subscription" },
      { status: 500 }
    );
  }
}
