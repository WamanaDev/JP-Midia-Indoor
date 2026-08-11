import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura encontrada" },
        { status: 404 }
      );
    }

    // Cancelar no Stripe (no fim do período)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Atualizar no banco
    await supabase
      .from("subscriptions")
      .update({ cancel_at_period_end: true })
      .eq("id", subscription.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
