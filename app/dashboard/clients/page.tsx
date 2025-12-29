import { Clients } from "@/components/dashboard/clients/Clients";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [clients] = await Promise.all([
    supabase.from("clients").select("*").eq("user_id", session.user.id),
  ]);
  return <Clients clients={clients.data} />;
}
