"use client";

import { Plan } from "@/interfaces/Plan";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CheckoutClientProps {
  plan: Plan;
  currentPlanName?: string;
}

export default function CheckoutClient({
  plan,
  currentPlanName,
}: CheckoutClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar sessão de checkout");
      }

      // Redirecionar para o Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Botão Voltar */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o dashboard
        </Link>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-[#1E3A8A] to-[#3B82F6] px-8 py-10 text-white">
            <h1 className="text-3xl font-bold mb-2">Assinar {plan.name}</h1>
            <p className="text-blue-100">{plan.description}</p>
          </div>

          {/* Conteúdo */}
          <div className="px-8 py-10">
            {/* Preço */}
            <div className="mb-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  {plan.price === null ? "Personalizado" : `R$ ${plan.price}`}
                </span>
                <span className="text-xl text-gray-600">/mês</span>
              </div>
              <p className="text-sm text-green-600 font-medium">
                ✨ Inclui 14 dias de teste grátis
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                O que está incluído:
              </h3>
              <ul className="space-y-3">
                {plan.features
                  .filter((f) => f.included)
                  .map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{feature.text}</span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Plano Atual */}
            {currentPlanName && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Plano atual:{" "}
                  <span className="font-semibold text-gray-900">
                    {currentPlanName}
                  </span>
                </p>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botão de Checkout */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-[#3B82F6] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#1E3A8A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                "Continuar para pagamento"
              )}
            </button>

            {/* Informações de segurança */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                🔒 Pagamento seguro processado pelo Stripe
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Você pode cancelar a qualquer momento
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Perguntas frequentes
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-gray-900">
                Como funciona o período de teste?
              </p>
              <p className="text-gray-600 mt-1">
                Você tem 14 dias para testar todas as funcionalidades do plano
                sem custo. Após o período, será cobrado automaticamente.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Posso cancelar?</p>
              <p className="text-gray-600 mt-1">
                Sim! Você pode cancelar a qualquer momento e continuará com
                acesso até o fim do período pago.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Posso mudar de plano depois?
              </p>
              <p className="text-gray-600 mt-1">
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento
                através do portal de gerenciamento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
