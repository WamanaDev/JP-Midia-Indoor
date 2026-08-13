import { Alerts } from "@/components/dashboard/alerts/Alerts";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AlertsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const [screens, alerts] = await Promise.all([
    supabase
      .from("screens")
      .select("id, name, location, is_active")
      .eq("user_id", session.user.id)
      .order("name"),
    supabase
      .from("emergency_alerts")
      .select("*, screen:screens(name)")
      .eq("user_id", session.user.id)
      .is("dismissed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  return <Alerts screens={screens.data ?? []} initialAlerts={alerts.data ?? []} />;
}
