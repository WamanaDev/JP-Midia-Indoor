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

    // Criar SetupIntent no Stripe
    const setupIntent = await stripe.setupIntents.create({
      customer: profile.stripe_customer_id,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Erro ao criar SetupIntent:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar sessão" },
      { status: 500 }
    );
  }
}
