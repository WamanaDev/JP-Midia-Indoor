import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { UsageDashboardClient } from "@/components/dashboard/UsageDashboardClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface UsageData {
  screens: {
    current: number;
    max: number | null;
    unlimited: boolean;
    percentage: number;
  };
  storage: {
    current_gb: number;
    max_gb: number | null;
    unlimited: boolean;
    percentage: number;
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Buscar estatísticas
  const [playlists, medias, screens, logs] = await Promise.all([
    supabase.from("playlists").select("id").eq("user_id", user.id),
    supabase.from("medias").select("id").eq("user_id", user.id),
    supabase.from("screens").select("id, is_online").eq("user_id", user.id),
    supabase
      .from("logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stats = {
    totalPlaylists: playlists.data?.length || 0,
    totalMedia: medias.data?.length || 0,
    totalScreens: screens.data?.length || 0,
    activeScreens: screens.data?.filter((s) => s.is_online).length || 0,
  };

  // Buscar dados de uso
  let usage: UsageData | null = null;

  try {
    const { data: usageData, error } = await supabase.rpc("get_user_usage", {
      p_user_id: user.id,
    });

    if (!error && usageData) {
      usage = usageData as UsageData;
    }
  } catch (error) {
    console.error("Erro ao buscar dados de uso:", error);
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Client (suas estatísticas existentes) */}
      <DashboardClient stats={stats} recentLogs={logs.data || []} />

      {/* Dashboard de Uso */}
      {usage && (
        <div className="space-y-6">
          {/* Título e Descrição */}
          <div>
            <h2 className="text-3xl font-bold text-[#111827] dark:text-white mb-2">
              Uso do Plano
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhe o uso de recursos do seu plano atual e gerencie seus
              limites
            </p>
          </div>

          {/* Componente de Uso */}
          <UsageDashboardClient usage={usage} />
        </div>
      )}
    </div>
  );
}
