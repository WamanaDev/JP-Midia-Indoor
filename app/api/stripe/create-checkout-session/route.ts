import { stripe, TRIAL_PERIOD_DAYS } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe/helpers";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar informações do plano
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o plano é gratuito
    if (plan.price === 0 || plan.price === null) {
      return NextResponse.json(
        { error: "Este plano não requer checkout" },
        { status: 400 }
      );
    }

    // Verificar se o plano tem idStripe configurado
    if (!plan.idStripe) {
      return NextResponse.json(
        { error: "Plano não configurado no Stripe" },
        { status: 400 }
      );
    }

    // Buscar profile do usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Criar ou recuperar customer do Stripe (ISSO SALVA NO PROFILE)
    const customerId = await getOrCreateStripeCustomer(
      user.id,
      user.email!,
      profile?.full_name || undefined
    );

    // Verificar se já tem uma assinatura ativa
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Se já tem assinatura ativa, redirecionar para o portal
    if (
      existingSubscription?.stripe_subscription_id &&
      (existingSubscription.status === "active" ||
        existingSubscription.status === "trialing")
    ) {
      return NextResponse.json(
        {
          error:
            "Você já possui uma assinatura ativa. Use o portal do cliente para gerenciá-la.",
        },
        { status: 400 }
      );
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.idStripe,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
      success_url: `${
        process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
      }/dashboard?checkout=success`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
      }/dashboard?checkout=canceled`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("❌ Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar sessão de checkout" },
      { status: 500 }
    );
  }
}
