import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface AccessBlockedProps {
  reason: "past_due";
  message: string;
}

export function AccessBlocked({ message }: AccessBlockedProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-3">
              Pagamento Pendente
            </h2>

            <p className="text-red-800 dark:text-red-400 mb-6">{message}</p>

            <Link
              href="/dashboard/subscriptions"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <AlertCircle className="w-5 h-5" />
              Atualizar Pagamento
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
