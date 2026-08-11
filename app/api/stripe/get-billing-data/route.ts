import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

    // Se não tem subscription ou não tem customer_id, retornar vazio
    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({
        invoices: [],
        paymentMethod: null,
      });
    }

    try {
      // Tentar buscar faturas
      const invoices = await stripe.invoices.list({
        customer: subscription.stripe_customer_id,
        limit: 10,
      });

      // Tentar buscar método de pagamento padrão
      const customer = await stripe.customers.retrieve(
        subscription.stripe_customer_id
      );

      let paymentMethod = null;

      if (
        customer &&
        !customer.deleted &&
        customer.invoice_settings?.default_payment_method
      ) {
        const pm = await stripe.paymentMethods.retrieve(
          customer.invoice_settings.default_payment_method as string
        );
        paymentMethod = pm;
      }

      return NextResponse.json({
        invoices: invoices.data,
        paymentMethod,
      });
    } catch (stripeError: any) {
      // Se o customer não existe no Stripe, limpar do banco
      if (stripeError.code === "resource_missing") {
        console.log("⚠️ Customer não existe no Stripe, limpando do banco...");

        await supabase
          .from("subscriptions")
          .update({
            stripe_customer_id: null,
            stripe_subscription_id: null,
            status: "canceled",
          })
          .eq("id", subscription.id);

        await supabase
          .from("profiles")
          .update({
            stripe_customer_id: null,
            subscription_status: null,
            current_period_end: null,
          })
          .eq("id", user.id);

        return NextResponse.json({
          invoices: [],
          paymentMethod: null,
        });
      }

      throw stripeError;
    }
  } catch (error: any) {
    console.error("❌ Error fetching billing data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
