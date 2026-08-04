import { Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#3B82F6] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 text-white mb-8">
          <div className="relative w-12 h-12 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Image
              src="/icons/Icons/logoquadrada.png"
              fill
              sizes="48px"
              alt="JP Mídia"
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-3xl">M</span>
            ídia <span className="text-3xl">I</span>
            ndoor
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <p className="text-7xl font-bold text-[#3B82F6] mb-2">404</p>
          <h1 className="text-2xl font-bold text-[#111827] mb-2">
            Página não encontrada
          </h1>
          <p className="text-gray-600 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-linear-to-r from-[#1E3A8A] to-[#3B82F6] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
          >
            <Home className="w-5 h-5" />
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
