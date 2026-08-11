import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Direito de arrependimento (art. 49 do CDC): 7 dias corridos a contar da cobrança.
const WITHDRAWAL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura encontrada" },
        { status: 404 }
      );
    }

    const invoices = await stripe.invoices.list({
      subscription: subscription.stripe_subscription_id,
      status: "paid",
      limit: 1,
    });

    const latestInvoice = invoices.data[0];

    if (!latestInvoice) {
      return NextResponse.json(
        {
          error:
            "Nenhuma cobrança encontrada para reembolsar. Se você ainda está no período de teste grátis, use o cancelamento normal.",
        },
        { status: 400 }
      );
    }

    if (Date.now() - latestInvoice.created * 1000 > WITHDRAWAL_WINDOW_MS) {
      return NextResponse.json(
        {
          error:
            "O prazo de 7 dias para arrependimento após a cobrança já passou. Você ainda pode cancelar a renovação futura pela opção de cancelamento normal.",
        },
        { status: 400 }
      );
    }

    const invoicePayments = await stripe.invoicePayments.list({
      invoice: latestInvoice.id,
      status: "paid",
      limit: 1,
    });

    const payment = invoicePayments.data[0]?.payment;

    if (payment?.type === "payment_intent" && payment.payment_intent) {
      await stripe.refunds.create({
        payment_intent:
          typeof payment.payment_intent === "string"
            ? payment.payment_intent
            : payment.payment_intent.id,
      });
    } else if (payment?.type === "charge" && payment.charge) {
      await stripe.refunds.create({
        charge:
          typeof payment.charge === "string"
            ? payment.charge
            : payment.charge.id,
      });
    } else {
      return NextResponse.json(
        { error: "Não foi possível localizar o pagamento para reembolso." },
        { status: 500 }
      );
    }

    // Cancela imediatamente (não no fim do período, já que o valor foi devolvido).
    // O webhook customer.subscription.deleted sincroniza o status e volta o
    // usuário para o plano Freemium.
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error processing refund:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar reembolso" },
      { status: 500 }
    );
  }
}
