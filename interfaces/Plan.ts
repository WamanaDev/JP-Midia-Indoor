export interface Plan {
  id: string;
  name: string;
  price: number;
  price_text: string;
  max_screens: number;
  storage_db: number;
  support_level: string;
  schedule_level: string;
  reports_level: string;
  api_integration: boolean;
  white_label: boolean;
  created_at: string;
  highlighted: boolean;
  description: string;
  features: { text: string; included: boolean }[];
  idStripe: string;
}
