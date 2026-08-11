import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Receber dados do body
    const { new_plan_id } = await request.json();

    if (!new_plan_id) {
      return NextResponse.json(
        { error: "ID do novo plano é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar plano atual do usuário
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

    // Buscar detalhes dos planos
    const { data: currentPlan, error: currentPlanError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", profile.plan_id)
      .single();

    const { data: newPlan, error: newPlanError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", new_plan_id)
      .single();

    if (currentPlanError || newPlanError || !currentPlan || !newPlan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    console.log("📋 Planos:", {
      currentPlan: {
        id: currentPlan.id,
        name: currentPlan.name,
        price: currentPlan.price,
        idStripe: currentPlan.idStripe,
      },
      newPlan: {
        id: newPlan.id,
        name: newPlan.name,
        price: newPlan.price,
        idStripe: newPlan.idStripe,
      },
    });

    // Buscar subscription ativa
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("📊 Cenário detectado:", {
      hasSubscription: !!subscription,
      subscriptionId: subscription?.id,
      stripeSubscriptionId: subscription?.stripe_subscription_id,
      currentPlanPrice: currentPlan.price,
      newPlanPrice: newPlan.price,
      newPlanIdStripe: newPlan.idStripe,
    });

    // Determinar o cenário
    const currentPlanPrice = parseFloat(currentPlan.price || "0");
    const newPlanPrice = parseFloat(newPlan.price || "0");
    const isCurrentPlanFree = currentPlanPrice === 0;
    const isNewPlanFree = newPlanPrice === 0;

    // CENÁRIO 1: Gratuito → Pago (criar nova assinatura)
    if (isCurrentPlanFree && !isNewPlanFree) {
      console.log("✅ Cenário 1: Gratuito → Pago (criar assinatura)");

      if (!newPlan.idStripe) {
        return NextResponse.json(
          { error: "Novo plano não possui idStripe configurado" },
          { status: 400 }
        );
      }

      // Buscar stripe_customer_id do perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();

      console.log(
        "👤 Profile stripe_customer_id:",
        profile?.stripe_customer_id
      );

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: newPlan.idStripe,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
        metadata: {
          user_id: user.id,
          plan_id: new_plan_id,
        },
      };

      if (profile?.stripe_customer_id) {
        sessionParams.customer = profile.stripe_customer_id;
      } else {
        sessionParams.customer_email = user.email;
      }

      console.log("🔧 Criando sessão do Stripe com params:", {
        mode: sessionParams.mode,
        price: newPlan.idStripe,
        customer: sessionParams.customer || sessionParams.customer_email,
        success_url: sessionParams.success_url,
        cancel_url: sessionParams.cancel_url,
      });

      const session = await stripe.checkout.sessions.create(sessionParams);

      console.log("✅ Sessão criada:", {
        id: session.id,
        url: session.url,
      });

      return NextResponse.json({ url: session.url });
    }

    // CENÁRIO 2: Pago → Gratuito (cancelar assinatura)
    if (!isCurrentPlanFree && isNewPlanFree) {
      console.log("✅ Cenário 2: Pago → Gratuito (cancelar assinatura)");

      if (!subscription?.stripe_subscription_id) {
        return NextResponse.json(
          { error: "Subscription não encontrada no Stripe" },
          { status: 404 }
        );
      }

      try {
        // Tentar cancelar subscription no Stripe
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
        console.log("✅ Subscription cancelada no Stripe");
      } catch (stripeError: any) {
        // Se a subscription não existe no Stripe (teste), apenas logar e continuar
        if (stripeError.code === "resource_missing") {
          console.log(
            "⚠️ Subscription não existe no Stripe (ambiente de teste), continuando..."
          );
        } else {
          // Se for outro erro, lançar
          throw stripeError;
        }
      }

      // Atualizar no banco (independente do Stripe)
      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      // Atualizar plano do perfil para Freemium
      await supabase
        .from("profiles")
        .update({ plan_id: new_plan_id })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        message: "Você voltou ao plano Freemium com sucesso!",
      });
    }

    // CENÁRIO 3: Pago → Pago (atualizar assinatura)
    if (!isCurrentPlanFree && !isNewPlanFree) {
      console.log("✅ Cenário 3: Pago → Pago (atualizar assinatura)");

      if (!newPlan.idStripe) {
        console.log("❌ Novo plano não tem idStripe:", newPlan);
        return NextResponse.json(
          {
            error:
              "Novo plano não possui idStripe configurado no banco de dados",
          },
          { status: 400 }
        );
      }

      if (!subscription?.stripe_subscription_id) {
        return NextResponse.json(
          { error: "Subscription não encontrada" },
          { status: 404 }
        );
      }

      // Buscar subscription no Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );

      // Atualizar o item da subscription
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPlan.idStripe,
          },
        ],
        proration_behavior: "create_prorations",
      });

      // Atualizar no banco
      await supabase
        .from("subscriptions")
        .update({
          stripe_price_id: newPlan.idStripe,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      await supabase
        .from("profiles")
        .update({ plan_id: new_plan_id })
        .eq("id", user.id);

      return NextResponse.json({
        success: true,
        message: "Plano atualizado com sucesso!",
      });
    }

    // CENÁRIO 4: Gratuito → Gratuito (não deveria acontecer)
    return NextResponse.json(
      { error: "Não é possível trocar entre planos gratuitos" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ Erro ao processar mudança de plano:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar mudança de plano" },
      { status: 500 }
    );
  }
}
