// components/Hero.tsx
import { Monitor, Zap, Shield } from "lucide-react";
import Link from "next/link";

interface HeroProps {
  user: boolean;
}

export function Hero({ user }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#3B82F6] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                <Zap className="w-4 h-4" />
                Potência Máxima em Mídia Indoor
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              O jeito moderno de controlar
              <span className="block text-[#FACC15] mt-2">
                todas as suas telas
              </span>
            </h1>

            <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
              Suba de nível: automatize sua comunicação visual, reduza tarefas
              repetitivas e gerencie cada tela em segundos — de qualquer lugar,
              em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#1E3A8A] bg-white rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Ir para o Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#1E3A8A] bg-white rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Começar Grátis Agora
                </Link>
              )}
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#10B981]" />
                <span className="text-sm">Segurança de nível profissional</span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-[#10B981]" />
                <span className="text-sm">
                  Gerencie telas em qualquer lugar
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6] to-[#FACC15] opacity-20 blur-3xl"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-white/40 rounded w-24 mb-2"></div>
                        <div className="h-2 bg-white/30 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="bg-white/30 rounded h-32"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="h-2 bg-white/40 rounded w-16 mb-3"></div>
                      <div className="h-8 bg-white/30 rounded"></div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <div className="h-2 bg-white/40 rounded w-16 mb-3"></div>
                      <div className="h-8 bg-white/30 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
