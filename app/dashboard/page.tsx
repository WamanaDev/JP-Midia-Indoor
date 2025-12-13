import DashboardClient from "@/components/dashboard/DashboardClient";
import { Screen } from "@/interfaces/screen";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session?.user.id;

  // Busca dados respeitando RLS
  const [playlistsRes, mediaRes, screensRes, logsRes] = await Promise.all([
    supabase
      .from("playlists")
      .select("*", { count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("media_files")
      .select("*", { count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("screens")
      .select("*", { count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Formata os dados para o client component
  const stats = {
    totalPlaylists: playlistsRes.count ?? 0,
    totalMedia: mediaRes.count ?? 0,
    totalScreens: screensRes.count ?? 0,
    activeScreens:
      screensRes.data?.filter((s: Screen) => s.is_online).length ?? 0,
  };

  const recentLogs = logsRes.data ?? [];

  // Passa tudo para o Client Component
  return <DashboardClient stats={stats} recentLogs={recentLogs} />;
}
