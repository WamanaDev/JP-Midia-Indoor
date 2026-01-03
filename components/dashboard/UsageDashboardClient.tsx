"use client";

import {
  AlertCircle,
  AlertTriangle,
  HardDrive,
  Monitor,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

interface Props {
  usage: UsageData;
}

export function UsageDashboardClient({ usage: initialUsage }: Props) {
  const [usage, setUsage] = useState(initialUsage);
  const [showPastDueBanner, setShowPastDueBanner] = useState(
    initialUsage.is_past_due || false
  );

  // Atualizar uso a cada 10 segundos
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/usage");

        // ✅ Tratar erro 402 (Payment Required)
        if (response.status === 402) {
          await response.json();
          setShowPastDueBanner(true);
          console.log("⚠️ Pagamento pendente detectado");
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUsage(data);
          setShowPastDueBanner(data.is_past_due || false);
          console.log("✅ Usage atualizado, is_past_due:", data.is_past_due);
        }
      } catch (error) {
        console.error("Erro ao buscar uso:", error);
      }
    };

    const interval = setInterval(fetchUsage, 10000); // 10 segundos
    return () => clearInterval(interval);
  }, []);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "from-[#EF4444] to-[#DC2626]";
    if (percentage >= 80) return "from-[#FACC15] to-[#F59E0B]";
    return "from-[#3B82F6] to-[#1E3A8A]";
  };

  const shouldShowWarning = (percentage: number) => percentage >= 80;

  const usageCards = [
    {
      icon: Monitor,
      label: "Telas Criadas",
      current: usage.screens.current,
      max: usage.screens.max,
      unlimited: usage.screens.unlimited,
      percentage: usage.screens.percentage,
      color: "from-[#3B82F6] to-[#1E3A8A]",
      unit: "",
    },
    {
      icon: HardDrive,
      label: "Armazenamento",
      current: usage.storage.current_gb,
      max: usage.storage.max_gb,
      unlimited: usage.storage.unlimited,
      percentage: usage.storage.percentage,
      color: "from-[#10B981] to-[#059669]",
      unit: "GB",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ✅ Banner de pagamento pendente */}
      {showPastDueBanner && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-1">
                Pagamento Pendente
              </h3>
              <p className="text-sm text-red-800 dark:text-red-400 mb-4">
                Não conseguimos processar o pagamento da sua assinatura.
                Atualize seu método de pagamento para continuar usando os
                recursos premium.
              </p>
              <Link
                href="/dashboard/subscriptions"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <AlertCircle className="w-4 h-4" />
                Atualizar Pagamento
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de upgrade se próximo do limite */}
      {!showPastDueBanner &&
        (shouldShowWarning(usage.screens.percentage) ||
          shouldShowWarning(usage.storage.percentage)) && (
          <div className="bg-linear-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-linear-to-r from-[#FACC15] to-[#F59E0B] rounded-lg flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-1">
                  Você está próximo do limite
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Considere fazer upgrade para continuar sem interrupções e
                  desbloquear recursos ilimitados.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  <Zap className="w-4 h-4" />
                  Fazer Upgrade
                </Link>
              </div>
            </div>
          </div>
        )}

      {/* Cards de uso */}
      <div className="grid md:grid-cols-2 gap-6">
        {usageCards.map((card, index) => {
          const Icon = card.icon;
          const progressColor = getProgressColor(card.percentage);

          return (
            <div
              key={index}
              className="bg-white dark:bg-[#1F2937] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-linear-to-r ${card.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {card.unlimited && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                    Ilimitado
                  </span>
                )}
              </div>

              {/* Label */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                {card.label}
              </p>

              {/* Valor */}
              <div className="flex items-baseline gap-2 mb-4">
                <p className="text-3xl font-bold text-[#111827] dark:text-white">
                  {card.unit === "GB" ? card.current.toFixed(2) : card.current}
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  / {card.unlimited ? "∞" : card.max} {card.unit}
                </p>
              </div>

              {/* Barra de progresso */}
              {!card.unlimited && (
                <>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-2 bg-linear-to-r ${progressColor} rounded-full transition-all duration-500`}
                      style={{
                        width: `${Math.min(card.percentage, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(card.percentage)}% utilizado
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
