"use client";

import { Modal } from "@/components/ui/Modal";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  CreditCard,
  HardDrive,
  Monitor,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Profile {
  id: string;
  plan_id: string;
  plan: Plan;
}

interface Plan {
  id: string;
  name: string;
  price: number | null;
  max_screens: number;
  storage_gb: number;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

interface Usage {
  screens: {
    current: number;
  };
  storage: {
    current_gb: number;
  };
}

interface PaymentRequiredClientProps {
  subscription: Subscription | null;
  profile: Profile | null;
  usage: Usage | null;
}

export function PaymentRequiredClient({
  subscription,
  profile,
  usage,
}: PaymentRequiredClientProps) {
  const [loading, setLoading] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleUpdatePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar sessão");
      }

      window.location.href = data.url;
    } catch (error: any) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
      setLoading(false);
    }
  };

  const handleDowngradeClick = () => {
    setShowDowngradeModal(true);
  };

  const handleDowngradeConfirm = async () => {
    setLoading(true);

    try {
      // Buscar plano gratuito
      const response = await fetch("/api/plans/free");
      const { plan } = await response.json();

      if (!plan) {
        throw new Error("Plano gratuito não encontrado");
      }

      // Fazer downgrade
      const changeResponse = await fetch("/api/stripe/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_plan_id: plan.id }),
      });

      const changeData = await changeResponse.json();

      if (!changeResponse.ok) {
        throw new Error(changeData.error || "Erro ao fazer downgrade");
      }

      setShowDowngradeModal(false);
      setShowSuccessModal(true);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
      setShowDowngradeModal(false);
    } finally {
      setLoading(false);
    }
  };

  const screensOverLimit =
    (usage?.screens?.current || 0) > (profile?.plan?.max_screens || 0);
  const storageOverLimit =
    (usage?.storage?.current_gb || 0) > (profile?.plan?.storage_gb || 0);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl w-full space-y-6">
          {/* Header de Alerta */}
          <div className="bg-linear-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Pagamento Pendente</h1>
                <p className="text-red-50 text-lg">
                  Não conseguimos processar seu pagamento. Atualize seu método
                  de pagamento para continuar usando os recursos premium.
                </p>
              </div>
            </div>
          </div>

          {/* Opções de Ação */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Atualizar Pagamento */}
            <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-2">
                Atualizar Pagamento
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Atualize seu cartão de crédito para continuar com seu plano
                atual sem perder acesso.
              </p>
              <button
                onClick={handleUpdatePayment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    Atualizar Cartão
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Fazer Downgrade */}
            <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800 shadow-sm">
              <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-2">
                Voltar ao Gratuito
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Cancele sua assinatura e ajuste manualmente suas telas e
                armazenamento aos limites gratuitos.
              </p>
              <button
                onClick={handleDowngradeClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
              >
                Fazer Downgrade
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Uso Atual */}
          <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-4">
              Seu Uso Atual
            </h3>

            <div className="space-y-4">
              {/* Telas */}
              <div
                className={`p-4 rounded-lg ${
                  screensOverLimit
                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    <span className="font-semibold">Telas</span>
                  </div>
                  <span className="text-sm font-bold">
                    {usage?.screens?.current || 0} /{" "}
                    {profile?.plan?.max_screens || 0}
                  </span>
                </div>
                {screensOverLimit && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ⚠️ Você está acima do limite. Exclua{" "}
                    {(usage?.screens?.current || 0) -
                      (profile?.plan?.max_screens || 0)}{" "}
                    tela(s).
                  </p>
                )}
              </div>

              {/* Storage */}
              <div
                className={`p-4 rounded-lg ${
                  storageOverLimit
                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    <span className="font-semibold">Armazenamento</span>
                  </div>
                  <span className="text-sm font-bold">
                    {(usage?.storage?.current_gb || 0).toFixed(2)} GB /{" "}
                    {profile?.plan?.storage_gb || 0} GB
                  </span>
                </div>
                {storageOverLimit && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ⚠️ Você está acima do limite. Exclua{" "}
                    {(
                      (usage?.storage?.current_gb || 0) -
                      (profile?.plan?.storage_gb || 0)
                    ).toFixed(2)}{" "}
                    GB.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Link para Gerenciar */}
          <div className="text-center">
            <Link
              href="/dashboard/subscriptions"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver detalhes da assinatura
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Downgrade */}
      <Modal
        isOpen={showDowngradeModal}
        onClose={() => setShowDowngradeModal(false)}
        title="Confirmar Downgrade"
        description="Tem certeza que deseja voltar ao plano gratuito?"
        type="warning"
        confirmText="Sim, fazer downgrade"
        cancelText="Cancelar"
        onConfirm={handleDowngradeConfirm}
        confirmLoading={loading}
      >
        <div className="space-y-3">
          <p className="text-sm">Ao confirmar, você:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Perderá acesso aos recursos premium imediatamente</li>
            <li>Precisará ajustar suas telas e armazenamento manualmente</li>
            <li>Sua assinatura será cancelada no Stripe</li>
          </ul>
        </div>
      </Modal>

      {/* Modal de Sucesso */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/dashboard");
        }}
        title="Downgrade Realizado!"
        description="Você agora está no plano gratuito."
        type="success"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm">
            Ajuste suas telas e armazenamento aos limites do plano gratuito.
          </p>
        </div>
      </Modal>

      {/* Modal de Erro */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Erro"
        description={errorMessage}
        type="error"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Modal>
    </>
  );
}
