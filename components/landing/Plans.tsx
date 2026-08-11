"use client";

import { Plan } from "@/interfaces/Plan";
import { Profile } from "@/interfaces/Profile";
import { Check, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface PricingProps {
  profile: Profile | null;
  plans: Plan[] | null;
  user: boolean;
}

export function Plans({ profile, plans, user }: PricingProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.set(".plan-card", { opacity: 0, y: 32 });
      ScrollTrigger.batch(".plan-card", {
        start: "top 88%",
        once: true,
        onEnter: (elements) =>
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
          }),
      });
    },
    { scope: sectionRef, dependencies: [plans] },
  );

  return (
    <section id="pricing" ref={sectionRef} className="py-24 bg-[#05070D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Planos flexíveis para seu negócio
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comece com o plano gratuito e evolua no seu ritmo.
          </p>
        </div>

        {/* GRID */}
        {!plans || plans.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/[0.03] rounded-2xl border border-white/10">
            <p className="text-lg font-medium text-white mb-2">
              Nossos planos estão sendo atualizados
            </p>
            <p className="text-gray-400">
              Tente novamente em instantes ou fale com a gente para saber
              mais.
            </p>
          </div>
        ) : (
          <div className="plans-grid grid md:grid-cols-4 gap-8">
            {plans &&
              plans.map((plan, index) => {
                const isCurrent = plan.id === profile?.plan_id;
                const isHighlighted = plan.highlighted;

                /* CARD STYLES */
                const cardClasses = isCurrent
                  ? "bg-white/[0.02] text-gray-400 border border-white/10 opacity-90"
                  : isHighlighted
                  ? "bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white shadow-[0_0_50px_-10px_rgba(59,130,246,0.6)] transform scale-105 border-2 border-[#60A5FA]"
                  : "bg-white/[0.03] border border-white/10 hover:border-[#3B82F6]/50 transition-all";

                return (
                  <div
                    key={index}
                    className={`plan-card relative rounded-2xl p-8 ${cardClasses}`}
                  >
                    {/* BADGES */}
                    {isCurrent && (
                      <div className="inline-block px-3 py-1 bg-white/10 text-gray-300 text-xs font-semibold rounded-full mb-4 border border-white/10">
                        ✔ Plano atual
                      </div>
                    )}

                    {!isCurrent && isHighlighted && (
                      <div className="inline-block px-4 py-1 bg-[#FACC15] text-[#1E3A8A] text-sm font-bold rounded-full mb-4 shadow-sm animate-pulse">
                        ★ Mais escolhido
                      </div>
                    )}

                    {/* TÍTULO */}
                    <h3
                      className={`text-2xl font-bold mb-2 ${
                        isCurrent
                          ? "text-gray-300"
                          : isHighlighted
                          ? "text-white"
                          : "text-white"
                      }`}
                    >
                      {plan.name}
                    </h3>

                    {/* DESCRIÇÃO */}
                    <p
                      className={`mb-6 ${
                        isCurrent
                          ? "text-gray-500"
                          : isHighlighted
                          ? "text-gray-200"
                          : "text-gray-400"
                      }`}
                    >
                      {plan.description}
                    </p>

                    {/* PREÇO */}
                    <div className="mb-8">
                      <span
                        className={`${
                          plan.price === null ? "text-2xl" : "text-5xl"
                        } font-bold ${
                          isCurrent
                            ? "text-gray-400"
                            : isHighlighted
                            ? "text-white"
                            : "text-white"
                        }`}
                      >
                        {plan.price === null
                          ? plan.price_text || "Personalizado"
                          : `R$${plan.price}`}
                      </span>
                      <span
                        className={`text-lg ml-1 ${
                          isCurrent
                            ? "text-gray-500"
                            : isHighlighted
                            ? "text-gray-200"
                            : "text-gray-400"
                        }`}
                      >
                        /mês
                      </span>
                    </div>

                    {/* BOTÃO */}
                    {!isCurrent && (
                      <Link
                        href={
                          plan.price === null
                            ? "mailto:contato@jpmidia.com"
                            : user
                            ? `/checkout/${plan.id}`
                            : "/auth/signin"
                        }
                        className={`w-full p-4 rounded-lg font-semibold transition-all inline-block text-center ${
                          isHighlighted
                            ? "bg-white text-[#1E3A8A] hover:bg-gray-100"
                            : "bg-[#3B82F6] text-white hover:bg-[#1E3A8A]"
                        }`}
                      >
                        {plan.price === null
                          ? "Falar com Vendas"
                          : user
                          ? "Assinar agora"
                          : "Começar agora"}
                      </Link>
                    )}

                    {/* FEATURES */}
                    <ul className="space-y-4 mt-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-[#10B981] mt-0.5 shrink-0" />
                          ) : (
                            <X
                              className={`w-5 mt-0.5 shrink-0 ${
                                isHighlighted || isCurrent
                                  ? "text-gray-500"
                                  : "text-gray-600"
                              }`}
                            />
                          )}
                          <span
                            className={`${
                              feature.included
                                ? isHighlighted
                                  ? "text-white"
                                  : isCurrent
                                  ? "text-gray-300"
                                  : "text-white"
                                : "text-gray-500"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-3 text-gray-400 text-sm">
          <ShieldCheck className="w-5 h-5 text-[#10B981]" />
          Todo plano pago tem 7 dias de garantia incondicional — cancele e
          receba reembolso integral, sem perguntas.
        </div>
      </div>
    </section>
  );
}
