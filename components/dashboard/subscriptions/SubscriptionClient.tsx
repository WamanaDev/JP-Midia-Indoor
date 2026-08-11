"use client";

import { Plan } from "@/interfaces/Plan";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  plan_id: string;
  plan: Plan;
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

interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
}

interface SubscriptionClientProps {
  profile: Profile | null;
  subscription: Subscription | null;
}

export function SubscriptionClient({
  profile,
  subscription,
}: SubscriptionClientProps) {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [removingCardId, setRemovingCardId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const router = useRouter();

  const currentPlan = profile?.plan;

  // Buscar faturas e métodos de pagamento
  useEffect(() => {
    if (subscription?.stripe_subscription_id) {
      fetchBillingData();
    } else {
      setLoadingData(false);
    }
  }, [subscription]);

  const fetchBillingData = async () => {
    setLoadingData(true);
    try {
      // Buscar faturas
      const invoicesResponse = await fetch("/api/stripe/get-billing-data");
      const invoicesData = await invoicesResponse.json();

      if (invoicesResponse.ok) {
        setInvoices(invoicesData.invoices || []);
      }

      // Buscar métodos de pagamento
      const paymentMethodsResponse = await fetch(
        "/api/stripe/get-payment-methods"
      );
      const paymentMethodsData = await paymentMethodsResponse.json();

      if (paymentMethodsResponse.ok) {
        setPaymentMethods(paymentMethodsData.paymentMethods || []);
      }
    } catch (error) {
      console.error("Erro ao buscar dados de cobrança:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/create-setup-intent", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar sessão");
      }

      // Redirecionar para página de atualização de cartão
      router.push(
        `/dashboard/subscriptions/update-card?client_secret=${data.clientSecret}`
      );
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleRemoveCard = async (paymentMethodId: string) => {
    if (!confirm("Tem certeza que deseja remover este cartão?")) {
      return;
    }

    setRemovingCardId(paymentMethodId);

    try {
      const response = await fetch("/api/stripe/remove-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao remover cartão");
      }

      alert("Cartão removido com sucesso!");
      await fetchBillingData(); // Atualizar lista
    } catch (error: any) {
      alert(error.message);
    } finally {
      setRemovingCardId(null);
    }
  };

  const handleSetDefaultCard = async (paymentMethodId: string) => {
    setSettingDefaultId(paymentMethodId);

    try {
      const response = await fetch("/api/stripe/set-default-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao definir cartão padrão");
      }

      alert("Cartão padrão definido com sucesso!");
      await fetchBillingData(); // Atualizar lista
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura?")) {
      return;
    }

    setCancelLoading(true);

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cancelar assinatura");
      }

      alert("Assinatura cancelada com sucesso!");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCancelLoading(false);
    }
  };

  // Direito de arrependimento (art. 49 do CDC): 7 dias corridos a contar da cobrança.
  const latestPaidInvoice = invoices.find((invoice) => invoice.status === "paid");
  const withinWithdrawalWindow =
    !!latestPaidInvoice &&
    Date.now() - latestPaidInvoice.created * 1000 <= 7 * 24 * 60 * 60 * 1000;

  const handleRequestRefund = async () => {
    if (
      !confirm(
        "Isso cancela sua assinatura imediatamente e devolve o valor da última cobrança. Deseja continuar?"
      )
    ) {
      return;
    }

    setRefundLoading(true);

    try {
      const response = await fetch("/api/stripe/request-refund", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao solicitar reembolso");
      }

      alert(
        "Reembolso solicitado! O valor deve aparecer na sua fatura em alguns dias úteis."
      );
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setRefundLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao reativar assinatura");
      }

      alert("Assinatura reativada com sucesso!");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      active: {
        label: "Ativa",
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        icon: CheckCircle,
      },
      trialing: {
        label: "Período de Teste",
        color:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        icon: AlertCircle,
      },
      canceled: {
        label: "Cancelada",
        color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        icon: XCircle,
      },
      past_due: {
        label: "Pagamento Pendente",
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getInvoiceStatusConfig = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: {
        label: "Paga",
        className:
          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      },
      open: {
        label: "Aberta",
        className:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      },
      void: {
        label: "Cancelada",
        className:
          "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
      },
      uncollectible: {
        label: "Não cobrável",
        className:
          "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
      },
    };
    return (
      statusMap[status] || {
        label: status,
        className: "bg-gray-100 text-gray-800",
      }
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getCardBrandName = (brand: string) => {
    const brands: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      diners: "Diners Club",
      jcb: "JCB",
      unionpay: "UnionPay",
    };
    return brands[brand.toLowerCase()] || brand;
  };

  const getBrandIcon = (brand: string) => {
    return "💳";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#111827] dark:text-white mb-2">
          Minha Assinatura
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie seu plano e informações de pagamento
        </p>
      </div>

      {/* Plano Atual */}
      <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-2">
              Plano Atual
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {currentPlan?.description}
            </p>
          </div>
          {subscription && getStatusBadge(subscription.status)}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Nome do Plano */}
          <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-linear-to-br from-[#3B82F6] to-[#1E3A8A] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plano</p>
            </div>
            <p className="text-2xl font-bold text-[#111827] dark:text-white">
              {currentPlan?.name}
            </p>
          </div>

          {/* Preço */}
          <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor</p>
            </div>
            <p className="text-2xl font-bold text-[#111827] dark:text-white">
              {currentPlan?.price != null
                ? `R$ ${currentPlan.price}/mês`
                : "Gratuito"}
            </p>
          </div>

          {/* Próxima Cobrança */}
          {subscription && (
            <div className="p-4 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.cancel_at_period_end
                    ? "Cancela em"
                    : "Renova em"}
                </p>
              </div>
              <p className="text-lg font-bold text-[#111827] dark:text-white">
                {new Date(subscription.current_period_end).toLocaleDateString(
                  "pt-BR"
                )}
              </p>
            </div>
          )}
        </div>

        {/* Aviso de Cancelamento */}
        {subscription?.cancel_at_period_end && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                  Assinatura será cancelada
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
                  Você continuará com acesso aos recursos premium até{" "}
                  {new Date(subscription.current_period_end).toLocaleDateString(
                    "pt-BR"
                  )}
                  . Após essa data, seu plano será alterado para gratuito.
                </p>
                <button
                  onClick={handleReactivateSubscription}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                  {loading ? "Processando..." : "Reativar Assinatura"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Métodos de Pagamento */}
      {subscription && currentPlan?.price != null && (
        <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#111827] dark:text-white">
              Métodos de Pagamento
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchBillingData}
                disabled={loadingData}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loadingData ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={handleUpdatePaymentMethod}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Adicionar Cartão
              </button>
            </div>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-white dark:bg-[#1F2937] rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl">
                      {getBrandIcon(method.brand)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#111827] dark:text-white capitalize">
                          {getCardBrandName(method.brand)} •••• {method.last4}
                        </p>
                        {method.isDefault && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Expira em {method.exp_month.toString().padStart(2, "0")}
                        /{method.exp_year}
                      </p>
                    </div>
                  </div>

                  {/* Ações do cartão */}
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefaultCard(method.id)}
                        disabled={settingDefaultId === method.id}
                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
                        title="Definir como padrão"
                      >
                        {settingDefaultId === method.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                        Definir Padrão
                      </button>
                    )}

                    <button
                      onClick={() => handleRemoveCard(method.id)}
                      disabled={
                        removingCardId === method.id ||
                        (method.isDefault && paymentMethods.length === 1)
                      }
                      className="px-3 py-2 text-sm border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
                      title={
                        method.isDefault && paymentMethods.length === 1
                          ? "Não é possível remover o único cartão padrão"
                          : "Remover cartão"
                      }
                    >
                      {removingCardId === method.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Nenhum método de pagamento cadastrado
              </p>
              <button
                onClick={handleUpdatePaymentMethod}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {loading ? "Carregando..." : "Adicionar Cartão"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Histórico de Faturas */}
      {invoices.length > 0 && (
        <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-4">
            Histórico de Faturas
          </h3>

          <div className="space-y-3">
            {invoices.map((invoice) => {
              const statusConfig = getInvoiceStatusConfig(invoice.status);

              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-[#111827] dark:text-white">
                      {invoice.number || `Fatura #${invoice.id.slice(-8)}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(invoice.created * 1000).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                    <p className="font-bold text-[#111827] dark:text-white">
                      {formatCurrency(invoice.amount_paid, invoice.currency)}
                    </p>
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Baixar PDF"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade */}
      <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-white">
              Fazer Upgrade
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Desbloquear mais recursos
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          target="_blank"
        >
          Ver Planos Disponíveis
          <TrendingUp className="w-5 h-5" />
        </Link>
      </div>

      {/* Direito de arrependimento (art. 49 CDC) */}
      {subscription &&
        subscription.status !== "canceled" &&
        !subscription.cancel_at_period_end &&
        withinWithdrawalWindow && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
            <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300 mb-2">
              Se arrependeu da assinatura?
            </h3>
            <p className="text-sm text-orange-800 dark:text-orange-400 mb-4">
              Você tem até 7 dias corridos após a cobrança para desistir e
              receber o valor de volta integralmente, conforme o art. 49 do
              Código de Defesa do Consumidor. Isso cancela sua assinatura
              imediatamente.
            </p>
            <button
              onClick={handleRequestRefund}
              disabled={refundLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 font-semibold"
            >
              {refundLoading
                ? "Processando..."
                : "Cancelar e solicitar reembolso"}
            </button>
          </div>
        )}

      {/* Cancelar Assinatura */}
      {subscription &&
        subscription.status !== "canceled" &&
        !subscription.cancel_at_period_end &&
        currentPlan?.price != null && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
              Cancelar Assinatura
            </h3>
            <p className="text-sm text-red-800 dark:text-red-400 mb-4">
              Você continuará com acesso até o fim do período pago. Após isso,
              seu plano será alterado para gratuito.
            </p>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
            >
              {cancelLoading ? "Cancelando..." : "Cancelar Assinatura"}
            </button>
          </div>
        )}
    </div>
  );
}
