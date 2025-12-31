export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: "starter" | "pro" | "enterprise" | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  canceled_at: string | null;
  max_screens: number | null;
  max_storage_gb: number | null;
  created_at: string;
  updated_at: string | null;
}
