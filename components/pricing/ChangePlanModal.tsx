"use client";

import { Plan } from "@/interfaces/Plan";
import {
  AlertCircle,
  ArrowRight,
  Check,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan;
  newPlan: Plan;
}

export function ChangePlanModal({
  isOpen,
  onClose,
  currentPlan,
  newPlan,
}: ChangePlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const isUpgrade = (newPlan.price || 0) > (currentPlan.price || 0);
  const isDowngrade = (newPlan.price || 0) < (currentPlan.price || 0);

  // Calcular diferença de preço
  const priceDifference = Math.abs(
    (newPlan.price || 0) - (currentPlan.price || 0)
  );

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_plan_id: newPlan.id }),
      });

      const data = await response.json();

      console.log("📦 Resposta da API no modal:", data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao trocar de plano");
      }

      // Se retornou URL, redirecionar para checkout do Stripe
      if (data.url) {
        console.log("✅ Redirecionando para Stripe Checkout:", data.url);
        window.location.href = data.url;
        return;
      }

      // Se não tem URL, foi uma mudança de plano sem checkout (ex: downgrade)
      if (data.success) {
        console.log("✅ Plano alterado com sucesso, recarregando página");
        router.refresh();
        onClose();
        return;
      }

      // Caso padrão: recarregar página
      router.refresh();
      onClose();
    } catch (err: any) {
      console.error("❌ Erro ao confirmar mudança de plano:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop com blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-[#1F2937] rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] opacity-10" />
          <div className="relative flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {isUpgrade ? (
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              ) : isDowngrade ? (
                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-[#111827] dark:text-white">
                  {isUpgrade
                    ? "Fazer Upgrade"
                    : isDowngrade
                    ? "Fazer Downgrade"
                    : "Trocar de Plano"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confirme a alteração do seu plano
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Comparação de planos com cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Plano Atual */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Plano Atual
              </p>
              <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-1">
                {currentPlan.name}
              </h3>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {currentPlan.price !== null
                  ? `R$ ${currentPlan.price}`
                  : "Gratuito"}
                {currentPlan.price !== null && (
                  <span className="text-sm font-normal">/mês</span>
                )}
              </p>
            </div>

            {/* Novo Plano */}
            <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">
                Novo Plano
              </p>
              <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-1">
                {newPlan.name}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {newPlan.price !== null ? `R$ ${newPlan.price}` : "Gratuito"}
                {newPlan.price !== null && (
                  <span className="text-sm font-normal">/mês</span>
                )}
              </p>
            </div>
          </div>

          {/* Seção de Cobrança */}
          {priceDifference > 0 && (
            <div
              className={`p-4 rounded-xl border-2 ${
                isUpgrade
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isUpgrade
                      ? "bg-green-100 dark:bg-green-900/40"
                      : "bg-orange-100 dark:bg-orange-900/40"
                  }`}
                >
                  <DollarSign
                    className={`w-5 h-5 ${
                      isUpgrade
                        ? "text-green-600 dark:text-green-400"
                        : "text-orange-600 dark:text-orange-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold mb-1 ${
                      isUpgrade
                        ? "text-green-900 dark:text-green-300"
                        : "text-orange-900 dark:text-orange-300"
                    }`}
                  >
                    {isUpgrade
                      ? "Cobrança Proporcional"
                      : "Crédito no Próximo Ciclo"}
                  </p>
                  <p
                    className={`text-sm ${
                      isUpgrade
                        ? "text-green-800 dark:text-green-400"
                        : "text-orange-800 dark:text-orange-400"
                    }`}
                  >
                    {isUpgrade ? (
                      <>
                        Você será cobrado aproximadamente{" "}
                        <span className="font-bold">
                          R$ {priceDifference.toFixed(2)}
                        </span>{" "}
                        de diferença proporcional ao tempo restante do período
                        atual.
                      </>
                    ) : (
                      <>
                        A diferença de{" "}
                        <span className="font-bold">
                          R$ {priceDifference.toFixed(2)}
                        </span>{" "}
                        será creditada no próximo ciclo de cobrança.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Diferenças de recursos */}
          <div className="p-4 bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              O que muda:
            </p>
            <div className="space-y-2">
              {newPlan.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Informações sobre a troca */}
          <div
            className={`p-4 rounded-xl border-2 ${
              isUpgrade
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : isDowngrade && newPlan.price !== null
                ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  isUpgrade
                    ? "text-blue-600 dark:text-blue-400"
                    : isDowngrade && newPlan.price !== null
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              />
              <div
                className={`text-sm ${
                  isUpgrade
                    ? "text-blue-900 dark:text-blue-300"
                    : isDowngrade && newPlan.price !== null
                    ? "text-orange-900 dark:text-orange-300"
                    : "text-blue-900 dark:text-blue-300"
                }`}
              >
                {isUpgrade && (
                  <>
                    <p className="font-semibold mb-1">✨ Upgrade Imediato</p>
                    <p>
                      O upgrade será aplicado imediatamente. A partir do próximo
                      ciclo, será cobrado o valor integral do novo plano.
                    </p>
                  </>
                )}
                {isDowngrade && newPlan.price !== null && (
                  <>
                    <p className="font-semibold mb-1">
                      📅 Downgrade no Próximo Ciclo
                    </p>
                    <p>
                      Você continuará com acesso ao plano atual até o fim do
                      período pago. O novo plano entrará em vigor no próximo
                      ciclo de cobrança.
                    </p>
                  </>
                )}
                {newPlan.price === null && (
                  <>
                    <p className="font-semibold mb-1">
                      🔄 Cancelamento da Assinatura
                    </p>
                    <p>
                      Sua assinatura será cancelada, mas você continuará com
                      acesso aos recursos premium até o fim do período pago.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Confirmar Alteração</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
