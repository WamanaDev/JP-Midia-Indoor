"use client";

import { Monitor, Layers, BarChart3, Clock, Shield, Zap } from "lucide-react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const features = [
  {
    icon: Monitor,
    title: "Controle Absoluto das Telas",
    description:
      "Gerencie cada display em segundos. Atualize conteúdos em massa, remotamente e em tempo real — sem complicação.",
  },
  {
    icon: Layers,
    title: "Playlists Inteligentes",
    description:
      "Organize campanhas como um profissional. Programe mídias, defina ciclos, horários e fluxos totalmente automatizados.",
  },
  {
    icon: BarChart3,
    title: "Monitoramento em Tempo Real",
    description:
      "Veja o status de cada tela, uptime, última atualização e desempenho — tudo ao vivo, em um painel claro e rápido.",
  },
  {
    icon: Clock,
    title: "Agendamento Automático",
    description:
      "Programe conteúdos para datas e horários específicos. Deixe o sistema trabalhar por você com automação total.",
  },
  {
    icon: Shield,
    title: "Segurança de Alto Nível",
    description:
      "Criptografia de ponta, controle de permissões e operação segura. Seu conteúdo sempre protegido.",
  },
  {
    icon: Zap,
    title: "Performance Imediata",
    description:
      "Interface otimizada, carregamento instantâneo e atualizações rápidas. Suas telas nunca ficam desatualizadas.",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      ScrollTrigger.batch(".feature-card", {
        start: "top 88%",
        once: true,
        onEnter: (elements) =>
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
          }),
      });

      if (prefersReducedMotion()) return;

      const quickSetters = cardRefs.current.map((card) => {
        if (!card) return null;
        return {
          x: gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power2.out" }),
          y: gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power2.out" }),
        };
      });

      const handlers: Array<() => void> = [];

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const setter = quickSetters[i];
        if (!setter) return;

        const onMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          setter.x(px * 10);
          setter.y(py * -10);
        };
        const onLeave = () => {
          setter.x(0);
          setter.y(0);
        };

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        handlers.push(() => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
        });
      });

      return () => handlers.forEach((off) => off());
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 bg-[#05070D] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Tecnologia feita para escalar
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Potencialize sua comunicação visual com ferramentas profissionais,
            rápidas e seguras — tudo em um único lugar.
          </p>
        </div>

        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{ perspective: 1000 }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="feature-card opacity-0 translate-y-8 bg-white/[0.03] rounded-xl p-8 border border-white/10 hover:border-[#3B82F6]/50 transition-colors duration-300 group"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-14 h-14 bg-linear-to-br from-[#1E3A8A] to-[#3B82F6] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
