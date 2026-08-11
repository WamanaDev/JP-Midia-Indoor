import { AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

interface OverLimitBannerProps {
  message: string;
}

export function OverLimitBanner({ message }: OverLimitBannerProps) {
  return (
    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          {message} Você pode apagar itens abaixo para voltar dentro do
          limite, ou fazer upgrade.
        </p>
      </div>
      <Link
        href="/pricing"
        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold text-sm"
      >
        <TrendingUp className="w-4 h-4" />
        Fazer Upgrade
      </Link>
    </div>
  );
}
