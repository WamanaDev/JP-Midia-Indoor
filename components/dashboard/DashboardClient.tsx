"use client";

import { Monitor, Play, Tv, TrendingUp } from "lucide-react";

interface Stats {
  totalPlaylists: number;
  totalMedia: number;
  totalScreens: number;
  activeScreens: number;
}

interface Log {
  id: string;
  user_id: string;
  screen_id: string;
  action: string;
  details: string;
  created_at: string;
}

interface DashboardClientProps {
  stats: Stats;
  recentLogs: Log[];
}

export default function DashboardClient({
  stats,
  recentLogs,
}: DashboardClientProps) {
  const statCards = [
    {
      icon: Monitor,
      label: "Playlists",
      value: stats.totalPlaylists,
      color: "from-[#3B82F6] to-[#1E3A8A]",
    },
    {
      icon: Play,
      label: "Mídias",
      value: stats.totalMedia,
      color: "from-[#10B981] to-[#059669]",
    },
    {
      icon: Tv,
      label: "Telas",
      value: stats.totalScreens,
      color: "from-[#FACC15] to-[#F59E0B]",
    },
    {
      icon: TrendingUp,
      label: "Telas Online",
      value: stats.activeScreens,
      color: "from-[#EF4444] to-[#DC2626]",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#111827] dark:text-white mb-2">
          Visão Geral
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe suas métricas em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-[#1F2937] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-linear-to-br ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-[#111827] dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-[#111827] dark:text-white">
            Atividades Recentes
          </h3>
        </div>
        <div className="p-6">
          {recentLogs.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Nenhuma atividade recente
            </p>
          ) : (
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="w-2 h-2 bg-[#3B82F6] rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-[#111827] dark:text-white font-medium">
                      {log.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
