import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export interface CreateClientDTO {
  name: string;
  company_name: string;
  cnpj: string;
  is_active?: boolean;
}

export async function listClients(userId: string) {
  return supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function getClientById(userId: string, clientId: string) {
  return supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("user_id", userId)
    .single();
}

export async function createClient(userId: string, data: CreateClientDTO) {
  return supabase.from("clients").insert({
    ...data,
    user_id: userId,
  });
}

export async function updateClient(
  userId: string,
  clientId: string,
  data: Partial<CreateClientDTO>
) {
  return supabase
    .from("clients")
    .update(data)
    .eq("id", clientId)
    .eq("user_id", userId);
}

export async function deleteClient(userId: string, clientId: string) {
  return supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("user_id", userId);
}
