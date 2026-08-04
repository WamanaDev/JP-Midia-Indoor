"use client";

import { Plan } from "@/interfaces/Plan";
import { Profile } from "@/interfaces/Profile";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface PricingProps {
  profile: Profile | null;
  plans: Plan[] | null;
  user: boolean;
}

export function Plans({ profile, plans, user }: PricingProps) {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#111827] mb-4">
            Planos flexíveis para seu negócio
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece com o plano gratuito e evolua no seu ritmo.
          </p>
        </div>

        {/* GRID */}
        {!plans || plans.length === 0 ? (
          <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-lg font-medium text-[#111827] mb-2">
              Nossos planos estão sendo atualizados
            </p>
            <p className="text-gray-600">
              Tente novamente em instantes ou fale com a gente para saber
              mais.
            </p>
          </div>
        ) : (
        <div className="grid md:grid-cols-4 gap-8">
          {plans &&
            plans.map((plan, index) => {
              const isCurrent = plan.id === profile?.plan_id;
              const isHighlighted = plan.highlighted;

              /* CARD STYLES */
              const cardClasses = isCurrent
                ? "bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB] opacity-90 shadow-inner"
                : isHighlighted
                ? "bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white shadow-2xl transform scale-105 border-4 border-[#3B82F6]"
                : "bg-white border-2 border-gray-200 hover:border-[#3B82F6] transition-all";

              return (
                <div key={index} className={`rounded-2xl p-8 ${cardClasses}`}>
                  {/* BADGES */}
                  {isCurrent && (
                    <div className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full mb-4 border border-gray-300">
                      ✔ Plano atual
                    </div>
                  )}

                  {!isCurrent && isHighlighted && (
                    <div className="inline-block px-4 py-1 bg-[#FACC15] text-[#1E3A8A] text-sm font-bold rounded-full mb-4 shadow-sm">
                      ★ Mais escolhido
                    </div>
                  )}

                  {/* TÍTULO */}
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      isCurrent
                        ? "text-[#374151]"
                        : isHighlighted
                        ? "text-white"
                        : "text-[#111827]"
                    }`}
                  >
                    {plan.name}
                  </h3>

                  {/* DESCRIÇÃO */}
                  <p
                    className={`mb-6 ${
                      isCurrent
                        ? "text-[#4B5563]"
                        : isHighlighted
                        ? "text-gray-200"
                        : "text-gray-600"
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
                          ? "text-gray-500"
                          : isHighlighted
                          ? "text-gray-200"
                          : "text-gray-900"
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
                          : "text-gray-900"
                      }`}
                    >
                      /mês
                    </span>
                  </div>

                  {/* BOTÃO */}
                  {!isCurrent && (
                    <Link
                      href={user ? `/checkout/${plan.id}` : "/auth/signin"}
                      className={`w-full p-4 rounded-lg font-semibold transition-all ${
                        isHighlighted
                          ? "bg-white text-[#1E3A8A] hover:bg-gray-100"
                          : "bg-[#3B82F6] text-white hover:bg-[#1E3A8A]"
                      }`}
                    >
                      {user ? "Assinar agora" : "Começar agora"}
                    </Link>
                  )}

                  {/* FEATURES */}
                  <ul className="space-y-4 mt-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-[#10B981] mt-0.5" />
                        ) : (
                          <X
                            className={`w-5 mt-0.5 ${
                              isHighlighted || isCurrent
                                ? "text-gray-400"
                                : "text-gray-300"
                            }`}
                          />
                        )}
                        <span
                          className={`${
                            feature.included
                              ? isHighlighted
                                ? "text-white"
                                : isCurrent
                                ? "text-[#374151]"
                                : "text-[#111827]"
                              : "text-gray-400"
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
      </div>
    </section>
  );
}
