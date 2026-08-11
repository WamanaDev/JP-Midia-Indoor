"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ✅ Validar chave do Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não está definida!");
}

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

interface UpdateCardFormProps {
  clientSecret: string;
}

function UpdateCardFormContent() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/subscriptions?success=true`,
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message || "Erro ao atualizar cartão");
        setIsLoading(false);
      } else {
        setSuccess(true);

        // ✅ Tentar processar pagamento pendente
        try {
          await fetch("/api/stripe/retry-payment", {
            method: "POST",
          });
        } catch (retryError) {
          console.error("Erro ao processar pagamento pendente:", retryError);
          // Não bloquear o fluxo se falhar
        }

        setTimeout(() => {
          router.push("/dashboard/subscriptions?success=true");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-2">
          Cartão Atualizado com Sucesso!
        </h3>
        <p className="text-green-800 dark:text-green-400">Redirecionando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#111827] dark:text-white">
              Informações do Cartão
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seus dados são protegidos pelo Stripe
            </p>
          </div>
        </div>

        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Atualizar Cartão
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function UpdateCardForm({ clientSecret }: UpdateCardFormProps) {
  // ✅ Validar clientSecret
  if (!clientSecret) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">
          Erro ao Carregar Formulário
        </h3>
        <p className="text-red-800 dark:text-red-400">
          Client secret não encontrado. Por favor, tente novamente.
        </p>
      </div>
    );
  }

  // ✅ Validar stripePromise
  if (!stripePromise) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">
          Erro de Configuração
        </h3>
        <p className="text-red-800 dark:text-red-400">
          Chave pública do Stripe não configurada. Contate o suporte.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#3B82F6",
          },
        },
      }}
    >
      <UpdateCardFormContent />
    </Elements>
  );
}
