"use client";

import { TrendingUp, Users, Smartphone, Globe } from "lucide-react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { Counter } from "@/components/landing/Counter";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".about-text > *", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-text", start: "top 80%", once: true },
      });

      gsap.from(".about-card", {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-cards", start: "top 82%", once: true },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="py-24 bg-[#0A0F1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="about-text">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Transforme seu espaço com Mídia Indoor
            </h2>

            <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
              <p>
                Mídia Indoor é a forma mais eficiente e moderna de comunicar
                dentro do seu ambiente comercial. Com telas digitais
                estratégicas, você exibe mensagens, ofertas e conteúdos
                dinâmicos no momento exato em que o cliente está mais atento.
              </p>

              <p>
                Ao contrário de cartazes estáticos, a mídia digital permite
                atualizações instantâneas, segmentação por horário, campanhas
                automatizadas e performance mensurável — tudo pensado para
                aumentar engajamento e conversão.
              </p>

              <p>
                Uma solução ideal para lojas, restaurantes, academias,
                clínicas, escritórios e qualquer negócio que deseja transmitir
                profissionalismo e elevar a experiência do cliente.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  <Counter to={45} prefix="+" suffix="%" />
                </h3>
                <p className="text-gray-400">Mais atenção e engajamento</p>
              </div>

              <div>
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-[#10B981]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  <Counter to={2000} prefix="+" />
                </h3>
                <p className="text-gray-400">
                  Negócios que já utilizam mídia digital
                </p>
              </div>
            </div>
          </div>

          <div className="about-cards relative">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="about-card bg-linear-to-br from-[#1E3A8A] to-[#3B82F6] rounded-2xl p-8 text-white shadow-[0_0_40px_-12px_rgba(59,130,246,0.5)]">
                  <Smartphone className="w-12 h-12 mb-4 opacity-80" />
                  <h4 className="text-xl font-semibold mb-2">
                    Controle Total
                  </h4>
                  <p className="text-gray-200">
                    Gerencie todas as telas do seu negócio pelo celular ou
                    computador
                  </p>
                </div>

                <div className="about-card bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                  <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-white">
                    Cloud First
                  </h4>
                  <p className="text-gray-400">
                    Infraestrutura moderna, rápida e pronta para escalar
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-12">
                <div className="about-card bg-[#FACC15] rounded-2xl p-8">
                  <div className="text-4xl font-bold text-[#1E3A8A] mb-2">
                    99.9%
                  </div>
                  <p className="text-[#1E3A8A] font-medium">
                    Uptime e estabilidade que seu negócio exige
                  </p>
                </div>

                <div className="about-card bg-linear-to-br from-[#10B981] to-[#059669] rounded-2xl p-8 text-white">
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <p className="text-gray-100">
                    Monitoramento contínuo das telas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
