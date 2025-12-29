"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface ResourceNotFoundProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function ResourceNotFound({
  title = "Recurso não encontrado",
  description = "O recurso que você está tentando acessar não existe ou foi removido.",
  backHref = "/dashboard",
  backLabel = "Voltar",
}: ResourceNotFoundProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>

          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>

        <div className="flex justify-center">
          <Link
            href={backHref}
            className="
              px-6 py-2
              bg-blue-600 hover:bg-blue-700
              text-white
              rounded-lg
              transition
            "
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
