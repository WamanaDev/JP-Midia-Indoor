import { stripe } from "@/lib/stripe";
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

    const { new_plan_id } = await request.json();

    if (!new_plan_id) {
      return NextResponse.json(
        { error: "ID do novo plano é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar profile do usuário
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Buscar plano atual
    const { data: currentPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("id", profile.plan_id)
      .single();

    // Buscar novo plano
    const { data: newPlan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", new_plan_id)
      .single();

    if (planError || !newPlan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    console.log("📋 Planos:", {
      currentPlan: {
        id: currentPlan?.id,
        name: currentPlan?.name,
        price: currentPlan?.price,
        idStripe: currentPlan?.idStripe,
      },
      newPlan: {
        id: newPlan.id,
        name: newPlan.name,
        price: newPlan.price,
        idStripe: newPlan.idStripe,
      },
    });

    // Verificar se já está nesse plano
    if (profile.plan_id === new_plan_id) {
      return NextResponse.json(
        { error: "Você já está neste plano" },
        { status: 400 }
      );
    }

    // Buscar subscription ativa
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .single();

    console.log("📊 Cenário detectado:", {
      hasSubscription: !!subscription,
      subscriptionId: subscription?.id,
      stripeSubscriptionId: subscription?.stripe_subscription_id,
      currentPlanPrice: currentPlan?.price,
      newPlanPrice: newPlan.price,
      newPlanIdStripe: newPlan.idStripe,
    });

    // CENÁRIO 1: Usuário no plano gratuito quer assinar plano pago
    if (
      !subscription &&
      currentPlan?.price === null &&
      newPlan.price !== null
    ) {
      console.log("✅ Cenário 1: Gratuito → Pago (criar nova assinatura)");

      if (!newPlan.idStripe) {
        return NextResponse.json(
          { error: "Plano não possui idStripe configurado" },
          { status: 400 }
        );
      }

      // Criar checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price: newPlan.idStripe,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
        metadata: {
          user_id: user.id,
          plan_id: new_plan_id,
        },
      });

      return NextResponse.json({
        success: true,
        redirect: true,
        url: session.url,
      });
    }

    // CENÁRIO 2: Usuário com plano pago quer trocar para plano gratuito
    if (subscription?.stripe_subscription_id && newPlan.price === null) {
      console.log("✅ Cenário 2: Pago → Gratuito (cancelar assinatura)");

      // Cancelar assinatura no Stripe (no fim do período)
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      // Atualizar no banco
      await supabase
        .from("subscriptions")
        .update({
          cancel_at_period_end: true,
        })
        .eq("id", subscription.id);

      return NextResponse.json({
        success: true,
        message: "Assinatura será cancelada no fim do período",
      });
    }

    // CENÁRIO 3: Usuário com plano pago quer trocar para outro plano pago
    if (subscription?.stripe_subscription_id && newPlan.price !== null) {
      console.log("✅ Cenário 3: Pago → Pago (atualizar assinatura)");

      // Verificar se o novo plano tem idStripe
      if (!newPlan.idStripe) {
        console.error("❌ Novo plano não tem idStripe:", newPlan);
        return NextResponse.json(
          {
            error:
              "Novo plano não possui idStripe configurado no banco de dados",
          },
          { status: 400 }
        );
      }

      try {
        // Buscar subscription no Stripe
        console.log(
          "🔍 Buscando subscription no Stripe:",
          subscription.stripe_subscription_id
        );
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );

        console.log("📦 Subscription do Stripe:", {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          items: stripeSubscription.items.data.map((item) => ({
            id: item.id,
            price: item.price.id,
          })),
        });

        // Atualizar subscription com novo price (pro-rata automático)
        console.log(
          "🔄 Atualizando subscription para price:",
          newPlan.idStripe
        );
        const updatedSubscription = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            items: [
              {
                id: stripeSubscription.items.data[0].id,
                price: newPlan.idStripe,
              },
            ],
            proration_behavior: "always_invoice", // Criar fatura pro-rata imediatamente
          }
        );

        console.log("✅ Subscription atualizada:", updatedSubscription.id);

        // Atualizar plano no banco
        await supabase
          .from("profiles")
          .update({ plan_id: new_plan_id })
          .eq("id", user.id);

        console.log("✅ Profile atualizado no banco");

        return NextResponse.json({
          success: true,
          message: "Plano alterado com sucesso",
        });
      } catch (stripeError: any) {
        console.error("❌ Erro no Stripe:", stripeError);
        return NextResponse.json(
          { error: `Erro no Stripe: ${stripeError.message}` },
          { status: 500 }
        );
      }
    }

    // CENÁRIO 4: Qualquer outro caso não tratado
    console.error("❌ Cenário não suportado:", {
      hasSubscription: !!subscription,
      subscriptionId: subscription?.id,
      stripeSubscriptionId: subscription?.stripe_subscription_id,
      currentPlanPrice: currentPlan?.price,
      newPlanPrice: newPlan.price,
      newPlanIdStripe: newPlan.idStripe,
    });

    return NextResponse.json(
      {
        error:
          "Cenário não suportado. Por favor, entre em contato com o suporte.",
        details: {
          hasSubscription: !!subscription,
          currentPlanPrice: currentPlan?.price,
          newPlanPrice: newPlan.price,
          hasIdStripe: !!newPlan.idStripe,
        },
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ Error changing plan:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao trocar de plano" },
      { status: 500 }
    );
  }
}
