"use client";

import { dismissAlertAction } from "@/app/dashboard/alerts/actions";
import { Siren, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  message: string;
  screenNames: string[];
  batchId: string;
  expiresAt: string;
  onExpire: (batchId: string) => void;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AlertCard({ message, screenNames, batchId, expiresAt, onExpire }: Props) {
  const [remainingMs, setRemainingMs] = useState(
    () => new Date(expiresAt).getTime() - Date.now()
  );
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const left = new Date(expiresAt).getTime() - Date.now();
      setRemainingMs(left);
      if (left <= 0) onExpire(batchId);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, batchId, onExpire]);

  return (
    <div className="flex items-start justify-between gap-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
      <div className="flex items-start gap-3 min-w-0">
        <Siren className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="min-w-0">
          <p className="text-[#111827] dark:text-white font-semibold break-words">{message}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Telas: {screenNames.join(", ") || "—"}
          </p>
          <p className="text-xs text-red-700 dark:text-red-400 font-mono mt-1">
            Some em {formatRemaining(remainingMs)}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={dismissing}
        onClick={async () => {
          setDismissing(true);
          await dismissAlertAction(batchId);
        }}
        className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 shrink-0"
      >
        <X className="w-4 h-4" />
        {dismissing ? "Encerrando…" : "Encerrar"}
      </button>
    </div>
  );
}
