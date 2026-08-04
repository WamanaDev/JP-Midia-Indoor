"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CTAProps {
  user: boolean;
}

export function CTA({ user }: CTAProps) {
  return (
    <section className="py-24 bg-linear-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#3B82F6] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Sua comunicação merece evoluir — e isso começa agora.
        </h2>

        <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
          Aumente o impacto da sua marca com telas inteligentes e conteúdo que
          realmente chama atenção. Comece no plano gratuito e veja a diferença
          na prática.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-[#1E3A8A] bg-white rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Ir para o Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-[#1E3A8A] bg-white rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          <a
            href="mailto:contato@jpmidia.com"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg hover:bg-white/20 transition-all"
          >
            Falar com Vendas
          </a>
        </div>

        <p className="mt-8 text-gray-300 text-sm">
          Comece no plano gratuito — sem cartão, sem compromisso, apenas
          resultados.
        </p>
      </div>
    </section>
  );
}
