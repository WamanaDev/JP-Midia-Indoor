"use client";

import { ShieldCheck, Lock, BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#05070D] text-gray-400 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <Link href="/">
                  <Image
                    src="/icons/Icons/logoquadrada.png"
                    alt="JP Mídia Indoor"
                    width={40}
                    height={40}
                  />
                </Link>
              </div>
              <span className="text-xl font-bold text-white">
                JP Mídia Indoor
              </span>
            </div>

            <p className="text-gray-500 leading-relaxed max-w-md mb-6">
              A plataforma completa para gestão de telas digitais em
              ambientes comerciais. Tecnologia confiável, controle total e
              automação para elevar o padrão da sua comunicação.
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                Conforme a LGPD
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-full">
                <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                Pagamento seguro via Stripe
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5 text-[#10B981]" />
                7 dias de garantia
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Produto</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Funcionalidades
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-white transition-colors"
                >
                  Planos e Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Dúvidas frequentes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contato@wamanadev.com.br"
                  className="hover:text-white transition-colors"
                >
                  Central de Suporte
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} JP Mídia Indoor. Todos os direitos
            reservados.
          </p>

          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Termos de Serviço
            </Link>
            <Link
              href="/cookies-policy"
              className="hover:text-white transition-colors"
            >
              Política de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
