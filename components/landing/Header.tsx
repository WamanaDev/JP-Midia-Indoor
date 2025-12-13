"use client";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  user: boolean;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br rounded-lg flex items-center justify-center">
              <Image
                width={10}
                height={10}
                src="/icons/Icons/logoquadrada2.png"
                alt="Logo"
                className="w-10 h-10"
              />
            </div>
            <span className="text-xl font-bold text-[#111827]">
              JP Mídia Indoor
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-[#3B82F6] transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#pricing"
              className="text-gray-700 hover:text-[#3B82F6] transition-colors"
            >
              Preços
            </a>

            {user ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-linear-to-r from-[#1E3A8A] to-[#3B82F6] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="px-6 py-2 bg-linear-to-r from-[#1E3A8A] to-[#3B82F6] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
