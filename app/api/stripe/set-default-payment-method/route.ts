import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Payment Method ID é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar perfil com stripe_customer_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Cliente Stripe não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o método de pagamento pertence ao cliente
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.customer !== profile.stripe_customer_id) {
      return NextResponse.json(
        { error: "Método de pagamento não pertence a este cliente" },
        { status: 403 }
      );
    }

    // Definir como método padrão
    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log("✅ Método de pagamento padrão definido:", paymentMethodId);

    return NextResponse.json({
      success: true,
      message: "Método de pagamento padrão definido com sucesso",
    });
  } catch (error: any) {
    console.error("❌ Erro ao definir método de pagamento padrão:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao definir método de pagamento padrão" },
      { status: 500 }
    );
  }
}
