"use client";

import { Plan } from "@/interfaces/Plan";
import { ArrowRight, Check, X, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChangePlanModal } from "./ChangePlanModal";

interface PricingClientProps {
  plans: Plan[];
  currentPlanId: string | null;
  isAuthenticated: boolean;
}

export function PricingClient({
  plans,
  currentPlanId,
  isAuthenticated,
}: PricingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const router = useRouter();

  const handleSelectPlan = async (plan: Plan) => {
    // Se já está no plano, não fazer nada
    if (plan.id === currentPlanId) return;

    // Se tem plano atual, mostrar modal de confirmação
    if (currentPlanId) {
      setSelectedPlan(plan);
      setShowChangePlanModal(true);
      return;
    }

    // Se não tem plano atual, ir direto para checkout
    setLoading(plan.id);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar sessão de checkout");
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch (error: any) {
      console.error("Erro ao processar checkout:", error);
      alert(error.message || "Erro ao processar checkout. Tente novamente.");
      setLoading(null);
    }
  };

  const getPlanBadge = (plan: Plan) => {
    if (plan.id === currentPlanId) {
      return (
        <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
          Plano Atual
        </span>
      );
    }

    if (plan.name.toLowerCase().includes("pro")) {
      return (
        <span className="inline-flex items-center px-3 py-1 bg-linear-to-r from-[#FACC15] to-[#F59E0B] text-white text-xs font-semibold rounded-full">
          Mais Popular
        </span>
      );
    }

    return null;
  };

  const getButtonText = (plan: Plan) => {
    if (plan.id === currentPlanId) return "Plano Atual";
    if (currentPlanId && plan.price !== null) {
      // Se tem plano atual e o novo é pago, é upgrade ou downgrade
      const currentPlan = plans.find((p) => p.id === currentPlanId);
      if (currentPlan) {
        const isUpgrade = (plan.price || 0) > (currentPlan.price || 0);
        return isUpgrade ? "Fazer Upgrade" : "Fazer Downgrade";
      }
    }
    if (plan.price === null) return "Começar Grátis";
    return "Assinar Agora";
  };

  const isButtonDisabled = (plan: Plan) => {
    return plan.id === currentPlanId || loading !== null;
  };

  // Renderizar card de plano
  const renderPlanCard = (plan: Plan) => {
    const isCurrentPlan = plan.id === currentPlanId;
    const isPopular = plan.name.toLowerCase().includes("pro");

    return (
      <div
        key={plan.id}
        className={`relative bg-white dark:bg-[#1F2937] rounded-2xl p-8 shadow-sm border transition-all hover:shadow-xl
          ${
            isPopular
              ? "border-[#3B82F6] ring-2 ring-[#3B82F6] ring-opacity-50 scale-105"
              : "border-gray-200 dark:border-gray-700"
          }
        `}
      >
        {/* Badge */}
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="inline-flex items-center gap-1 px-4 py-1 bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] text-white text-sm font-semibold rounded-full shadow-lg">
              <Zap className="w-4 h-4" />
              Recomendado
            </span>
          </div>
        )}

        {/* Plan Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-2xl font-bold text-[#111827] dark:text-white">
              {plan.name}
            </h3>
            {getPlanBadge(plan)}
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {plan.description}
          </p>

          {/* Price */}
          <div className="mb-6">
            {plan.price !== 0 && plan.price !== null ? (
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-[#111827] dark:text-white">
                  R$ {plan.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400">/mês</span>
              </div>
            ) : plan.price === null ? (
              <span className="text-5xl font-bold text-[#111827] dark:text-white">
                Personalizado
              </span>
            ) : (
              <span className="text-5xl font-bold text-[#111827] dark:text-white">
                Grátis
              </span>
            )}
          </div>

          {/* CTA Button */}
          {isAuthenticated ? (
            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={isButtonDisabled(plan)}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                ${
                  isCurrentPlan
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : isPopular
                    ? "bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] text-white hover:shadow-lg"
                    : "bg-[#3B82F6] text-white hover:bg-[#1E3A8A]"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading === plan.id ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {getButtonText(plan)}
                  {!isCurrentPlan && <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
                ${
                  isPopular
                    ? "bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] text-white hover:shadow-lg"
                    : "bg-[#3B82F6] text-white hover:bg-[#1E3A8A]"
                }
              `}
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Features List */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            Recursos inclusos:
          </p>
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
              )}
              <span
                className={
                  feature.included
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-400 dark:text-gray-600 line-through"
                }
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#111827] dark:text-white mb-4">
          Escolha o Plano Ideal
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Comece gratuitamente e faça upgrade quando precisar de mais recursos.
          Sem compromisso, cancele quando quiser.
        </p>
      </div>

      {/* Plans Grid - 3 primeiros planos */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {plans.slice(0, 3).map((plan) => renderPlanCard(plan))}
      </div>

      {/* Último plano centralizado */}
      {plans.length > 3 && (
        <div className="flex justify-center">
          <div className="w-full md:w-1/3">{renderPlanCard(plans[3])}</div>
        </div>
      )}

      {/* Modal de Troca de Plano */}
      {showChangePlanModal && selectedPlan && currentPlanId && (
        <ChangePlanModal
          isOpen={showChangePlanModal}
          onClose={() => {
            setShowChangePlanModal(false);
            setSelectedPlan(null);
          }}
          currentPlan={plans.find((p) => p.id === currentPlanId)!}
          newPlan={selectedPlan}
        />
      )}

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-[#111827] dark:text-white text-center mb-8">
          Perguntas Frequentes
        </h2>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-2">
              Posso cancelar a qualquer momento?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sim! Você pode cancelar sua assinatura a qualquer momento. Você
              continuará tendo acesso até o fim do período pago.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-2">
              Posso fazer upgrade ou downgrade do meu plano?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sim! Você pode alterar seu plano a qualquer momento. O valor será
              ajustado proporcionalmente (pro-rata).
            </p>
          </div>

          <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-2">
              Quais formas de pagamento são aceitas?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aceitamos cartões de crédito e débito através do Stripe, uma
              plataforma segura e confiável.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-2">
              O que acontece se eu atingir o limite do meu plano?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Você será notificado quando estiver próximo do limite. Para
              continuar criando telas ou fazendo uploads, será necessário fazer
              upgrade para um plano superior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
