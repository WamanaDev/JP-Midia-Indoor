import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Configurações de trial (período de teste)
export const TRIAL_PERIOD_DAYS = 7; // 7 dias de teste grátis

// Mapeamento de planos para Stripe Price IDs
// IMPORTANTE: Estes IDs serão preenchidos após criar os produtos no Stripe
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_ID_STARTER || "",
  professional: process.env.STRIPE_PRICE_ID_PROFESSIONAL || "",
  enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
} as const;

// Helper para obter o Price ID do Stripe baseado no plano
export function getStripePriceId(planName: string): string | null {
  const normalizedName = planName.toLowerCase();

  if (normalizedName === "starter") return STRIPE_PRICE_IDS.starter;
  if (normalizedName === "professional") return STRIPE_PRICE_IDS.professional;
  if (normalizedName === "enterprise") return STRIPE_PRICE_IDS.enterprise;

  return null;
}
