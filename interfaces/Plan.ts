export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number | null; // ← Adicionado | null para suportar Enterprise
  price_text: string;
  max_screens: number | null; // ← Adicionado | null para suportar Enterprise
  storage_gb: number | null; // ← Corrigido de storage_db para storage_gb e adicionado | null
  support_level: string;
  schedule_level: string;
  reports_level: string | null; // ← Adicionado | null
  api_integration: boolean;
  white_label: boolean;
  created_at: string;
  highlighted: boolean;
  description: string;
  features: PlanFeature[];
  idStripe: string | null; // ← Adicionado | null para planos sem Stripe
}
