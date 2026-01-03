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

    // ✅ Adicionar 'id' no select
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, stripe_subscription_id, stripe_customer_id, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription não encontrada" },
        { status: 404 }
      );
    }

    console.log("📊 Subscription:", subscription);

    // Se não está past_due, não precisa fazer nada
    if (subscription.status !== "past_due") {
      return NextResponse.json({
        message: "Subscription já está ativa",
        status: subscription.status,
      });
    }

    // Buscar faturas pendentes
    const invoices = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      status: "open",
      limit: 1,
    });

    console.log("📄 Faturas pendentes:", invoices.data.length);

    if (invoices.data.length === 0) {
      return NextResponse.json({
        message: "Nenhuma fatura pendente encontrada",
      });
    }

    const invoice = invoices.data[0];
    console.log("💰 Tentando pagar fatura:", invoice.id);

    // Tentar pagar a fatura
    const paidInvoice = await stripe.invoices.pay(invoice.id);

    console.log("✅ Fatura paga:", paidInvoice.status);

    // Atualizar status no banco
    await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", subscription.id);

    return NextResponse.json({
      success: true,
      message: "Pagamento processado com sucesso",
      invoice_status: paidInvoice.status,
    });
  } catch (error: any) {
    console.error("❌ Erro ao processar pagamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar pagamento" },
      { status: 500 }
    );
  }
}
