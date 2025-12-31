"use client";

import { AlertCircle, X, Zap } from "lucide-react";
import Link from "next/link";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "screens" | "storage";
  currentUsage: number;
  maxUsage: number | null;
}

export function LimitReachedModal({
  isOpen,
  onClose,
  limitType,
  currentUsage,
  maxUsage,
}: LimitReachedModalProps) {
  if (!isOpen) return null;

  const messages = {
    screens: {
      title: "Limite de Telas Atingido",
      description: `Você atingiu o limite de ${maxUsage} telas do seu plano atual.`,
      suggestion:
        "Faça upgrade para criar mais telas e desbloquear recursos ilimitados!",
    },
    storage: {
      title: "Limite de Armazenamento Atingido",
      description: `Você atingiu o limite de ${maxUsage} GB de armazenamento do seu plano atual.`,
      suggestion:
        "Faça upgrade para ter mais espaço e continuar fazendo uploads!",
    },
  };

  const message = messages[limitType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{message.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600">{message.description}</p>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">{message.suggestion}</p>
          </div>

          {/* Usage Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Uso atual</span>
              <span className="text-sm font-bold text-gray-900">
                {currentUsage} / {maxUsage || "∞"}{" "}
                {limitType === "storage" ? "GB" : ""}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: maxUsage
                    ? `${Math.min((currentUsage / maxUsage) * 100, 100)}%`
                    : "100%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Fechar
          </button>
          <Link
            href="/pricing"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Fazer Upgrade
          </Link>
        </div>
      </div>
    </div>
  );
}
