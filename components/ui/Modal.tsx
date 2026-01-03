"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmLoading?: boolean;
  type?: "info" | "warning" | "error" | "success";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  confirmLoading = false,
  type = "info",
}: ModalProps) {
  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    info: {
      headerBg: "bg-blue-50 dark:bg-blue-950/30",
      headerBorder: "border-blue-200 dark:border-blue-800",
      titleColor: "text-blue-900 dark:text-blue-100",
      descColor: "text-blue-700 dark:text-blue-300",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
    },
    warning: {
      headerBg: "bg-yellow-50 dark:bg-yellow-950/30",
      headerBorder: "border-yellow-200 dark:border-yellow-800",
      titleColor: "text-yellow-900 dark:text-yellow-100",
      descColor: "text-yellow-700 dark:text-yellow-300",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700",
    },
    error: {
      headerBg: "bg-red-50 dark:bg-red-950/30",
      headerBorder: "border-red-200 dark:border-red-800",
      titleColor: "text-red-900 dark:text-red-100",
      descColor: "text-red-700 dark:text-red-300",
      buttonBg: "bg-red-600 hover:bg-red-700",
    },
    success: {
      headerBg: "bg-green-50 dark:bg-green-950/30",
      headerBorder: "border-green-200 dark:border-green-800",
      titleColor: "text-green-900 dark:text-green-100",
      descColor: "text-green-700 dark:text-green-300",
      buttonBg: "bg-green-600 hover:bg-green-700",
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop com blur corrigido */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200 my-8">
        {/* Header clean sem gradiente */}
        <div
          className={`${styles.headerBg} border-b ${styles.headerBorder} p-6 rounded-t-xl`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className={`text-xl font-bold ${styles.titleColor}`}>
                {title}
              </h3>
              {description && (
                <p className={`${styles.descColor} mt-1 text-sm`}>
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {children && (
          <div className="p-6 text-gray-700 dark:text-gray-300">{children}</div>
        )}

        {/* Footer com botões */}
        {onConfirm && (
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={onClose}
              disabled={confirmLoading}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={confirmLoading}
              className={`flex-1 px-4 py-2.5 ${styles.buttonBg} text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {confirmLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
