import { stripe } from "@/lib/stripe";
import { syncSubscriptionStatus } from "@/lib/stripe/helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Desabilitar o body parser do Next.js para webhooks
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verificar a assinatura do webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Processar o evento
  try {
    switch (event.type) {
      // Quando uma assinatura é criada
      case "customer.subscription.created":
        console.log("📥 Evento: customer.subscription.created");
        await syncSubscriptionStatus(event.data.object);
        break;

      // Quando uma assinatura é atualizada (upgrade, downgrade, renovação)
      case "customer.subscription.updated":
        console.log("📥 Evento: customer.subscription.updated");
        await syncSubscriptionStatus(event.data.object);
        break;

      // Quando uma assinatura é deletada/cancelada
      case "customer.subscription.deleted":
        console.log("📥 Evento: customer.subscription.deleted");
        await syncSubscriptionStatus(event.data.object);
        break;

      // Quando o período de trial termina
      case "customer.subscription.trial_will_end":
        console.log(
          "📥 Evento: Trial will end for subscription:",
          event.data.object.id
        );
        // Você pode enviar um email aqui avisando que o trial está acabando
        break;

      // Quando um pagamento é bem-sucedido
      case "invoice.payment_succeeded": {
        console.log("📥 Evento: invoice.payment_succeeded");
        const invoice = event.data.object as Stripe.Invoice;

        // Buscar a subscription através do lines
        const subscriptionId = invoice.lines.data[0]?.subscription;

        if (subscriptionId && typeof subscriptionId === "string") {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          await syncSubscriptionStatus(subscription);
        }
        break;
      }

      // Quando um pagamento falha
      case "invoice.payment_failed": {
        console.log("📥 Evento: invoice.payment_failed");
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.error("❌ Payment failed for invoice:", failedInvoice.id);

        // Buscar a subscription através do lines
        const subscriptionId = failedInvoice.lines.data[0]?.subscription;

        if (subscriptionId && typeof subscriptionId === "string") {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );

          // Buscar o usuário pelo customer_id
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profile) {
            // Atualizar status para indicar falha no pagamento
            await supabaseAdmin
              .from("profiles")
              .update({
                subscription_status: "past_due",
              })
              .eq("id", profile.id);

            await supabaseAdmin
              .from("subscriptions")
              .update({
                status: "past_due",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", subscriptionId);

            console.log("✅ Status atualizado para past_due");
          }
        }

        // Você pode enviar um email aqui avisando sobre a falha no pagamento
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
