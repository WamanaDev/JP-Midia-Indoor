"use client";

import { Monitor, ShieldCheck, Sparkles, PlayCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";

const NetworkBackground = dynamic(
  () =>
    import("@/components/landing/three/NetworkBackground").then(
      (mod) => mod.NetworkBackground,
    ),
  { ssr: false },
);

interface HeroProps {
  user: boolean;
}

export function Hero({ user }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (headlineRef.current && !prefersReducedMotion()) {
        // The gradient line relies on bg-clip-text spanning its full text
        // node, so it's excluded from the split (wrapping it in per-word
        // elements would break the clip) and animated as one block instead.
        const split = SplitText.create(headlineRef.current, {
          type: "words",
          wordsClass: "inline-block",
          ignore: ".hero-gradient-line",
        });
        tl.from(split.words, {
          yPercent: 120,
          opacity: 0,
          duration: 0.9,
          stagger: 0.06,
        }).from(
          ".hero-gradient-line",
          { opacity: 0, y: 24, duration: 0.8 },
          "-=0.5",
        );
      } else {
        tl.from(headlineRef.current, { opacity: 0, duration: 0.6 });
      }

      tl.from(
        ".hero-badge",
        { opacity: 0, y: -12, duration: 0.6 },
        "<",
      )
        .from(".hero-sub", { opacity: 0, y: 16, duration: 0.7 }, "-=0.5")
        .from(
          ".hero-cta",
          { opacity: 0, y: 16, duration: 0.6, stagger: 0.1 },
          "-=0.4",
        )
        .from(".hero-trust", { opacity: 0, y: 12, duration: 0.6 }, "-=0.3");
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#05070D] text-white overflow-hidden min-h-[92vh] flex items-center"
    >
      {/* Ambient gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.25),transparent)]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 w-[30rem] h-[30rem] bg-[#1E3A8A]/30 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-[26rem] h-[26rem] bg-[#FACC15]/10 rounded-full blur-[120px]" />

      <div className="absolute inset-0">
        <NetworkBackground />
      </div>

      {/* Legibility vignette over the 3D layer */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(5,7,13,0.35),rgba(5,7,13,0.85))]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 w-full">
        <div className="max-w-3xl mx-auto text-center">
          <span className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-[#FACC15]" />
            Mais de 2.000 negócios já automatizaram suas telas
          </span>

          <h1
            ref={headlineRef}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            O jeito moderno de controlar
            <span className="hero-gradient-line block mt-2 bg-linear-to-r from-[#60A5FA] via-[#3B82F6] to-[#FACC15] bg-clip-text text-transparent">
              todas as suas telas
            </span>
          </h1>

          <p className="hero-sub mt-8 text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Automatize sua comunicação visual, reduza tarefas repetitivas e
            gerencie cada tela em segundos — de qualquer lugar, em tempo real.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="hero-cta inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#05070D] bg-white rounded-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_-8px_rgba(255,255,255,0.35)] hover:-translate-y-0.5"
              >
                Ir para o Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="hero-cta inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#05070D] bg-white rounded-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_-8px_rgba(255,255,255,0.35)] hover:-translate-y-0.5"
              >
                Começar Grátis Agora
              </Link>
            )}

            <a
              href="#features"
              className="hero-cta inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/5 border border-white/15 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              <PlayCircle className="w-5 h-5" />
              Ver como funciona
            </a>
          </div>

          <div className="hero-trust mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 border-t border-white/10 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              Sem cartão de crédito para começar
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#10B981]" />
              Gerencie telas de qualquer lugar
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              7 dias de garantia incondicional
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
