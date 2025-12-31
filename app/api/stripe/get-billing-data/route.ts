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
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({
        invoices: [],
        paymentMethod: null,
      });
    }

    // Buscar faturas
    const invoices = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      limit: 10,
    });

    // Buscar método de pagamento padrão
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
  } catch (error: any) {
    console.error("❌ Error fetching billing data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
