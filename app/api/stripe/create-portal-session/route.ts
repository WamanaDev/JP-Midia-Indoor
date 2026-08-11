import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura encontrada" },
        { status: 404 }
      );
    }

    // Criar portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscriptions`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
