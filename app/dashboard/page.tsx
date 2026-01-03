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
  is_past_due?: boolean;
  subscription_status?: string;
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
  const [playlists, medias, screens, logs, profile, subscriptions] =
    await Promise.all([
      supabase.from("playlists").select("id").eq("user_id", user.id),
      supabase.from("media_files").select("id").eq("user_id", user.id),
      supabase.from("screens").select("id, is_online").eq("user_id", user.id),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("profiles")
        .select("bytes_usage, plan_id, plans(*)")
        .eq("id", user.id)
        .single(),
      // ✅ Buscar a subscription mais recente (ordenar por created_at)
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

  const stats = {
    totalPlaylists: playlists.data?.length || 0,
    totalMedia: medias.data?.length || 0,
    totalScreens: screens.data?.length || 0,
    activeScreens: screens.data?.filter((s) => s.is_online).length || 0,
  };

  // ✅ Calcular dados de uso
  let usage: UsageData | null = null;

  if (profile.data) {
    const plan = profile.data.plans as any;
    const screensCount = screens.data?.length || 0;
    const storageUsedBytes = profile.data.bytes_usage || 0;
    const storageUsedGb = storageUsedBytes / (1024 * 1024 * 1024);

    const maxScreens = plan?.max_screens || 1;
    const maxStorageGb = plan?.storage_gb || 1;

    const screensUnlimited = maxScreens === null;
    const storageUnlimited = maxStorageGb === null;

    const screensPercentage = screensUnlimited
      ? 0
      : (screensCount / maxScreens) * 100;

    const storagePercentage = storageUnlimited
      ? 0
      : (storageUsedGb / maxStorageGb) * 100;

    // ✅ Verificar se está past_due
    const subscription = subscriptions.data;
    const isPastDue = subscription?.status === "past_due";

    console.log("📊 Subscription found:", subscription);
    console.log("📊 Subscription status:", subscription?.status);
    console.log("⚠️ Is past due?", isPastDue);

    usage = {
      screens: {
        current: screensCount,
        max: screensUnlimited ? null : maxScreens,
        unlimited: screensUnlimited,
        percentage: screensPercentage,
      },
      storage: {
        current_gb: parseFloat(storageUsedGb.toFixed(2)),
        max_gb: storageUnlimited ? null : maxStorageGb,
        unlimited: storageUnlimited,
        percentage: storagePercentage,
      },
      is_past_due: isPastDue,
      subscription_status: subscription?.status || "none",
    };
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
