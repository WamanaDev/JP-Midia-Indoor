import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";

// Validar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
}

if (!supabaseServiceKey) {
  throw new Error("NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY is not defined");
}

// Criar cliente com Service Role Key
// Este cliente bypassa RLS automaticamente
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

// Função helper para garantir que estamos usando o cliente admin
export function getSupabaseAdmin() {
  return supabaseAdmin;
}
