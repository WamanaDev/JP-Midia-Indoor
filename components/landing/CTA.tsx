"use client";

import { ArrowRight, ShieldCheck, CreditCard, Lock } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

interface CTAProps {
  user: boolean;
}

export function CTA({ user }: CTAProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".cta-content > *", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-linear-to-br from-[#0A0F1C] via-[#0F1B3D] to-[#1E3A8A] relative overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(250,204,21,0.08),transparent)]" />

      <div className="cta-content relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Sua comunicação merece evoluir — e isso começa agora.
        </h2>

        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Aumente o impacto da sua marca com telas inteligentes e conteúdo que
          realmente chama atenção. Comece no plano gratuito e veja a diferença
          na prática.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-[#0A0F1C] bg-white rounded-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_-8px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
            >
              Ir para o Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-[#0A0F1C] bg-white rounded-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_-8px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
            >
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}

          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-lg hover:bg-white/20 transition-all"
          >
            Falar com Vendas
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#10B981]" />
            Comece sem cartão de crédito
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            7 dias de garantia incondicional
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#10B981]" />
            Pagamento seguro via Stripe
          </div>
        </div>
      </div>
    </section>
  );
}
