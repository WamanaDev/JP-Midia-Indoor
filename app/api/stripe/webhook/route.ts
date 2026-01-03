import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Signature missing" }, { status: 400 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("❌ Webhook signature error:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`\n🎯 Webhook: ${event.type} [${event.id}]`);

    const supabase = supabaseAdmin;
    const eventData = event.data.object as Record<string, any>;

    switch (event.type) {
      case "checkout.session.completed": {
        const userId = eventData.metadata?.user_id;
        const planId = eventData.metadata?.plan_id;
        const customerId =
          typeof eventData.customer === "string"
            ? eventData.customer
            : eventData.customer?.id;
        const subscriptionId =
          typeof eventData.subscription === "string"
            ? eventData.subscription
            : eventData.subscription?.id;

        console.log(
          `✅ Checkout: user=${userId}, plan=${planId}, customer=${customerId}, sub=${subscriptionId}`
        );

        if (!userId || !planId) {
          console.error("❌ Missing metadata");
          break;
        }

        // Atualizar perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            plan_id: planId,
          })
          .eq("id", userId)
          .select();

        if (profileError) {
          console.error("❌ Profile update error:", profileError);
        } else {
          console.log("✅ Profile updated:", profileData?.[0]?.id);
        }

        // Salvar subscription
        if (subscriptionId) {
          try {
            const subscriptionResponse = await stripe.subscriptions.retrieve(
              subscriptionId,
              {
                expand: ["latest_invoice", "customer"],
              }
            );
            const subData = subscriptionResponse as any;

            const currentPeriodEnd = subData.current_period_end
              ? new Date(subData.current_period_end * 1000).toISOString()
              : null;

            const { data: subInsertData, error: subError } = await supabase
              .from("subscriptions")
              .upsert(
                {
                  user_id: userId,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subData.id,
                  stripe_price_id: subData.items.data[0].price.id,
                  status: subData.status,
                  current_period_end: currentPeriodEnd,
                  cancel_at_period_end: subData.cancel_at_period_end || false,
                },
                {
                  onConflict: "stripe_subscription_id",
                }
              )
              .select();

            if (subError) {
              console.error("❌ Subscription save error:", subError);
            } else {
              console.log("✅ Subscription saved:", subInsertData?.[0]?.id);
            }
          } catch (stripeError: any) {
            console.error("❌ Stripe API error:", stripeError.message);
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        console.log("\n❌ PAGAMENTO FALHOU!");

        const subscriptionId =
          typeof eventData.subscription === "string"
            ? eventData.subscription
            : eventData.subscription?.id;

        console.log("- Subscription ID:", subscriptionId);

        if (subscriptionId) {
          const { error } = await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);

          if (error) {
            console.error("❌ Update status error:", error);
          } else {
            console.log("✅ Status updated: past_due");
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        console.log("\n✅ PAGAMENTO APROVADO!");

        const subscriptionId =
          typeof eventData.subscription === "string"
            ? eventData.subscription
            : eventData.subscription?.id;

        console.log("- Subscription ID:", subscriptionId);

        if (subscriptionId) {
          const { error } = await supabase
            .from("subscriptions")
            .update({ status: "active" })
            .eq("stripe_subscription_id", subscriptionId);

          if (error) {
            console.error("❌ Update status error:", error);
          } else {
            console.log("✅ Status updated: active");
          }
        }
        break;
      }

      case "payment_method.attached": {
        console.log("\n💳 CARTÃO ANEXADO!");

        const paymentMethodId = eventData.id;
        const customerId =
          typeof eventData.customer === "string"
            ? eventData.customer
            : eventData.customer?.id;

        console.log("- Payment Method ID:", paymentMethodId);
        console.log("- Customer ID:", customerId);

        if (customerId) {
          try {
            // Buscar subscription do cliente
            const { data: subscription } = await supabase
              .from("subscriptions")
              .select("stripe_subscription_id, status")
              .eq("stripe_customer_id", customerId)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            console.log("- Subscription found:", subscription);

            // Se a subscription está past_due, tentar cobrar
            if (
              subscription?.status === "past_due" &&
              subscription.stripe_subscription_id
            ) {
              console.log("🔄 Tentando cobrar fatura pendente...");

              // Buscar a última fatura não paga
              const invoices = await stripe.invoices.list({
                customer: customerId,
                status: "open",
                limit: 1,
              });

              if (invoices.data.length > 0) {
                const invoice = invoices.data[0];
                console.log("📄 Fatura encontrada:", invoice.id);

                // Tentar pagar a fatura
                const paidInvoice = await stripe.invoices.pay(invoice.id, {
                  payment_method: paymentMethodId,
                });

                console.log("✅ Fatura paga com sucesso!");
                console.log("- Status:", paidInvoice.status);

                // Atualizar status no banco
                await supabase
                  .from("subscriptions")
                  .update({ status: "active" })
                  .eq(
                    "stripe_subscription_id",
                    subscription.stripe_subscription_id
                  );

                console.log("✅ Status atualizado para active");
              } else {
                console.log("ℹ️ Nenhuma fatura pendente encontrada");
              }
            }
          } catch (error: any) {
            console.error("❌ Erro ao processar pagamento:", error.message);
          }
        }

        break;
      }

      case "customer.subscription.created": {
        console.log("\n🆕 SUBSCRIPTION CRIADA!");

        const subscriptionId = eventData.id;
        const customerId =
          typeof eventData.customer === "string"
            ? eventData.customer
            : eventData.customer?.id;

        console.log("- Subscription ID:", subscriptionId);
        console.log("- Customer ID:", customerId);

        // Buscar user_id pelo stripe_customer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          const currentPeriodEnd = eventData.current_period_end
            ? new Date(eventData.current_period_end * 1000).toISOString()
            : null;

          const { error } = await supabase.from("subscriptions").upsert(
            {
              user_id: profile.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: eventData.items.data[0].price.id,
              status: eventData.status,
              current_period_end: currentPeriodEnd,
              cancel_at_period_end: eventData.cancel_at_period_end || false,
            },
            {
              onConflict: "stripe_subscription_id",
            }
          );

          if (error) {
            console.error("❌ Erro ao criar subscription:", error);
          } else {
            console.log("✅ Subscription criada no banco");
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        console.log("\n🔄 SUBSCRIPTION ATUALIZADA!");

        const subscriptionId = eventData.id;
        console.log("- Subscription ID:", subscriptionId);
        console.log("- Status:", eventData.status);
        console.log("- Cancel at period end:", eventData.cancel_at_period_end);

        // Atualizar subscription no banco
        const currentPeriodEnd = eventData.current_period_end
          ? new Date(eventData.current_period_end * 1000).toISOString()
          : null;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: eventData.status,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: eventData.cancel_at_period_end || false,
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          console.error("❌ Erro ao atualizar subscription:", error);
        } else {
          console.log("✅ Subscription atualizada:", eventData.status);
        }

        break;
      }

      case "customer.subscription.deleted": {
        console.log("\n🗑️ SUBSCRIPTION DELETADA!");

        const subscriptionId = eventData.id;
        console.log("- Subscription ID:", subscriptionId);

        // Marcar como cancelada
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          console.error("❌ Erro ao cancelar subscription:", error);
        } else {
          console.log("✅ Subscription cancelada");

          // Voltar para plano gratuito
          const { data: subscription } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (subscription) {
            // Buscar plano gratuito
            const { data: freePlan } = await supabase
              .from("plans")
              .select("id")
              .eq("price", 0)
              .single();

            if (freePlan) {
              await supabase
                .from("profiles")
                .update({ plan_id: freePlan.id })
                .eq("id", subscription.user_id);

              console.log("✅ Usuário movido para plano gratuito");
            }
          }
        }

        break;
      }

      case "customer.subscription.trial_will_end": {
        console.log("\n⏰ TRIAL VAI ACABAR EM 3 DIAS!");
        // Aqui você pode enviar um email avisando o usuário
        break;
      }

      default:
        // Silenciar eventos não importantes
        console.log(`ℹ️ Evento não tratado: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook fatal error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
