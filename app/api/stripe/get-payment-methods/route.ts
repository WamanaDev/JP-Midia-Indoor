import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar stripe_customer_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({
        paymentMethods: [],
      });
    }

    // Buscar métodos de pagamento no Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: "card",
    });

    // Buscar o método padrão
    const customer = (await stripe.customers.retrieve(
      profile.stripe_customer_id
    )) as any;
    const defaultPaymentMethodId =
      customer.invoice_settings?.default_payment_method;

    // Formatar dados
    const formattedMethods = paymentMethods.data.map((pm: any) => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      exp_month: pm.card.exp_month,
      exp_year: pm.card.exp_year,
      isDefault: pm.id === defaultPaymentMethodId,
    }));

    return NextResponse.json({
      paymentMethods: formattedMethods,
    });
  } catch (error: any) {
    console.error("Erro ao buscar métodos de pagamento:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar métodos de pagamento" },
      { status: 500 }
    );
  }
}
