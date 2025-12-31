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
 * Sincroniza o status da assinatura do Stripe com o Supabase
 * USA CLIENTE ADMIN para bypassa RLS
 */
export async function syncSubscriptionStatus(
  stripeSubscription: any
): Promise<void> {
  console.log("🔄 Sincronizando assinatura:", stripeSubscription.id);

  const customerId = stripeSubscription.customer;
  const subscriptionId = stripeSubscription.id;
  const status = stripeSubscription.status;
  const priceId = stripeSubscription.items?.data?.[0]?.price?.id;

  // Validar e converter timestamps
  const currentPeriodEnd = stripeSubscription.current_period_end
    ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
    : null;

  const cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end || false;

  const trialEnd = stripeSubscription.trial_end
    ? new Date(stripeSubscription.trial_end * 1000).toISOString()
    : null;

  const canceledAt = stripeSubscription.canceled_at
    ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
    : null;

  console.log("📊 Dados da assinatura:", {
    customerId,
    subscriptionId,
    status,
    priceId,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    canceledAt,
  });

  // Buscar o profile específico
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, plan_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (profileError || !profile) {
    console.error(
      "❌ Profile não encontrado para customer:",
      customerId,
      profileError
    );
    return;
  }

  console.log("✅ Profile encontrado:", profile.id);

  // Buscar o plano pelo stripe_price_id
  const { data: plan, error: planError } = await supabaseAdmin
    .from("plans")
    .select("id, name, max_screens, storage_gb")
    .eq("idStripe", priceId)
    .single();

  if (planError) {
    console.error("⚠️ Plano não encontrado para priceId:", priceId, planError);
  } else {
    console.log("✅ Plano encontrado:", plan.name);
  }

  // Atualizar ou criar registro de subscription
  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", profile.id)
    .single();

  const subscriptionData = {
    user_id: profile.id,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    status,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: cancelAtPeriodEnd,
    trial_end: trialEnd,
    canceled_at: canceledAt,
    max_screens: plan?.max_screens || null,
    max_storage_gb: plan?.storage_gb || null,
    updated_at: new Date().toISOString(),
  };

  if (existingSub) {
    console.log("🔄 Atualizando subscription existente:", existingSub.id);
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update(subscriptionData)
      .eq("id", existingSub.id);

    if (updateError) {
      console.error("❌ Erro ao atualizar subscription:", updateError);
    } else {
      console.log("✅ Subscription atualizada com sucesso");
    }
  } else {
    console.log("➕ Criando nova subscription");
    const { error: insertError } = await supabaseAdmin
      .from("subscriptions")
      .insert(subscriptionData);

    if (insertError) {
      console.error("❌ Erro ao criar subscription:", insertError);
    } else {
      console.log("✅ Subscription criada com sucesso");
    }
  }

  // Atualizar o plano no profile se a assinatura estiver ativa ou em trial
  if (status === "active" || status === "trialing") {
    if (plan) {
      console.log("🔄 Atualizando plano do profile para:", plan.name);
      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({
          plan_id: plan.id,
          subscription_status: status,
          current_period_end: currentPeriodEnd,
        })
        .eq("id", profile.id);

      if (profileUpdateError) {
        console.error("❌ Erro ao atualizar profile:", profileUpdateError);
      } else {
        console.log("✅ Profile atualizado com sucesso");
      }
    }
  }

  // Se a assinatura foi cancelada, expirou ou não foi paga, voltar para o plano Freemium
  if (
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired" ||
    status === "past_due"
  ) {
    console.log(
      "⚠️ Assinatura encerrada/suspensa (status:",
      status,
      "), voltando para Freemium"
    );

    const { data: freemiumPlan } = await supabaseAdmin
      .from("plans")
      .select("id")
      .eq("name", "Freemium")
      .single();

    if (freemiumPlan) {
      await supabaseAdmin
        .from("profiles")
        .update({
          plan_id: freemiumPlan.id,
          subscription_status: status,
          current_period_end: null,
        })
        .eq("id", profile.id);

      console.log("✅ Profile voltou para Freemium");
    }
  }

  console.log("✅ Sincronização concluída");
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

/**
 * Verifica se o usuário pode criar mais telas
 */
export async function canCreateScreen(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("check_screen_limit", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error checking screen limit:", error);
    return false;
  }

  return data;
}

/**
 * Verifica se o usuário pode fazer upload de arquivo
 */
export async function canUploadFile(
  userId: string,
  fileSizeBytes: number
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("check_storage_limit", {
    p_user_id: userId,
    p_file_size: fileSizeBytes,
  });

  if (error) {
    console.error("Error checking storage limit:", error);
    return false;
  }

  return data;
}
