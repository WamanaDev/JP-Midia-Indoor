import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "../supabase-admin";
import { stripe } from "./index";

/**
 * Cria ou recupera um cliente Stripe para o usuário
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const supabase = await createClient();

  // Verificar se já existe um customer_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Criar novo cliente no Stripe
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      supabase_user_id: userId,
    },
  });

  // Salvar o customer_id no Supabase
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

/**
 * Cancela a assinatura do usuário e volta para o plano Freemium
 */
export async function cancelSubscription(userId: string): Promise<void> {
  console.log("🔄 Cancelando assinatura do usuário:", userId);

  // Buscar a subscription ativa do usuário
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("user_id", userId)
    .single();

  if (!subscription?.stripe_subscription_id) {
    console.error("❌ Subscription não encontrada para o usuário:", userId);
    return;
  }

  // Verificar se a subscription está ativa
  if (subscription.status !== "active" && subscription.status !== "trialing") {
    console.log("⚠️ Subscription já está inativa:", subscription.status);
    return;
  }

  try {
    // Cancelar no Stripe (cancela imediatamente)
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    console.log("✅ Subscription cancelada no Stripe");

    // O webhook vai processar o evento e atualizar o banco automaticamente
  } catch (error: any) {
    console.error("❌ Erro ao cancelar subscription no Stripe:", error);
    throw error;
  }
}
