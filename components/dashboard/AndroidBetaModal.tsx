"use client";

import { Tv, X, Mail } from "lucide-react";
import { useEffect, useState } from "react";

const SUPPORT_EMAIL = "contato@wamanadev.com.br";
export const ANDROID_BETA_MODAL_SHOWN_KEY = "android_beta_modal_shown";

export function AndroidBetaModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // DashboardShell only mounts once there's an authenticated session
    // (enforced by the layout's server-side redirect), so a mount with no
    // flag yet in this tab's sessionStorage means the user just logged in.
    if (sessionStorage.getItem(ANDROID_BETA_MODAL_SHOWN_KEY)) return;
    sessionStorage.setItem(ANDROID_BETA_MODAL_SHOWN_KEY, "1");
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full my-8">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 p-6 rounded-t-xl">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tv className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 text-center">
            Teste fechado do app para TV Android
          </h2>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Quer ajudar a testar o nosso aplicativo para TV Android? Envie um
            e-mail para{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {SUPPORT_EMAIL}
            </span>{" "}
            e aguarde: você vai receber por e-mail o link para baixar o app.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Agora não
            </button>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                "Quero testar o app para TV Android"
              )}`}
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Enviar e-mail
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
