import { AlertCircle, Lock, Trash2, TrendingUp } from "lucide-react";
import Link from "next/link";

interface AccessBlockedProps {
  reason: "past_due" | "exceeded_screens" | "exceeded_storage";
  message: string;
  currentScreens?: number;
  maxScreens?: number;
  currentStorageGb?: number;
  maxStorageGb?: number;
}

export function AccessBlocked({
  reason,
  message,
  currentScreens,
  maxScreens,
  currentStorageGb,
  maxStorageGb,
}: AccessBlockedProps) {
  const getConfig = () => {
    switch (reason) {
      case "past_due":
        return {
          title: "Pagamento Pendente",
          icon: AlertCircle,
          color: "red",
          action: {
            label: "Atualizar Pagamento",
            href: "/dashboard/subscriptions",
          },
        };
      case "exceeded_screens":
        return {
          title: "Limite de Telas Excedido",
          icon: Lock,
          color: "yellow",
          action: {
            label: "Fazer Upgrade",
            href: "/pricing",
          },
        };
      case "exceeded_storage":
        return {
          title: "Limite de Armazenamento Excedido",
          icon: Lock,
          color: "yellow",
          action: {
            label: "Fazer Upgrade",
            href: "/pricing",
          },
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div
          className={`bg-${config.color}-50 dark:bg-${config.color}-900/20 border-2 border-${config.color}-200 dark:border-${config.color}-800 rounded-xl p-8`}
        >
          <div className="text-center">
            <div
              className={`w-20 h-20 bg-${config.color}-500 rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <Icon className="w-10 h-10 text-white" />
            </div>

            <h2
              className={`text-2xl font-bold text-${config.color}-900 dark:text-${config.color}-300 mb-3`}
            >
              {config.title}
            </h2>

            <p
              className={`text-${config.color}-800 dark:text-${config.color}-400 mb-6`}
            >
              {message}
            </p>

            {/* Informações de uso */}
            {reason === "exceeded_screens" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Uso atual
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentScreens} / {maxScreens} telas
                </p>
              </div>
            )}

            {reason === "exceeded_storage" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Uso atual
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentStorageGb} GB / {maxStorageGb} GB
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={config.action.href}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 transition-colors font-semibold`}
              >
                {reason === "past_due" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
                {config.action.label}
              </Link>

              {reason !== "past_due" && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
                >
                  <Trash2 className="w-5 h-5" />
                  Gerenciar Recursos
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
