"use client";

import { AlertTriangle, X, Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  limitType: "screens" | "storage";
  currentUsage: number;
  maxUsage: number;
}

export function LimitReachedModal({
  isOpen,
  onClose,
  limitType,
  currentUsage,
  maxUsage,
}: Props) {
  if (!isOpen) return null;

  const messages = {
    screens: {
      title: "Limite de telas atingido",
      description: `Você atingiu o limite de ${maxUsage} telas do seu plano atual. Para criar mais telas, faça upgrade para um plano superior.`,
      unit: "telas",
    },
    storage: {
      title: "Limite de armazenamento atingido",
      description: `Você atingiu o limite de ${maxUsage} GB de armazenamento do seu plano atual. Para fazer upload de mais arquivos, faça upgrade para um plano superior.`,
      unit: "GB",
    },
  };

  const message = messages[limitType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop com blur corrigido */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full my-8">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header clean */}
        <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 p-6 rounded-t-xl">
          {/* Ícone de alerta */}
          <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>

          {/* Título */}
          <h2 className="text-xl font-bold text-red-900 dark:text-red-100 text-center">
            {message.title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Descrição */}
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {message.description}
          </p>

          {/* Uso atual */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Uso atual:
              </span>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {currentUsage} / {maxUsage} {message.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Fechar
            </button>
            <Link
              href="/pricing"
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Fazer Upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
