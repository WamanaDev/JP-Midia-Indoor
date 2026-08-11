"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const faqs = [
  {
    question: "Preciso de conhecimento técnico para usar a plataforma?",
    answer:
      "Não. O painel foi pensado para ser simples: você faz upload do conteúdo, escolhe a tela e programa a exibição em poucos cliques. Sem instalação complexa, sem TI dedicado.",
  },
  {
    question: "Quanto tempo leva para colocar minhas telas no ar?",
    answer:
      "Na maioria dos casos, minutos. Basta conectar o dispositivo à tela, vincular ao seu painel e enviar o primeiro conteúdo — tudo acontece em tempo real.",
  },
  {
    question: "Funciona em qualquer TV ou monitor que eu já tenho?",
    answer:
      "Sim. A plataforma roda em qualquer tela com um dispositivo de reprodução conectado, sem precisar trocar os equipamentos que seu negócio já usa.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim, direto pelo painel, sem burocracia. E se você mudar de ideia nos primeiros 7 dias após a contratação, tem direito a reembolso integral — é o seu direito de arrependimento garantido pelo Código de Defesa do Consumidor.",
  },
  {
    question: "Meus dados e conteúdo estão protegidos?",
    answer:
      "Sim. Usamos criptografia de ponta, controle de permissões por usuário e seguimos as diretrizes da LGPD para o tratamento de dados.",
  },
  {
    question: "O que acontece se eu precisar de mais telas no futuro?",
    answer:
      "Você faz upgrade de plano a qualquer momento, sem perder configurações, playlists ou histórico. O sistema cresce junto com o seu negócio.",
  },
];

export function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useGSAP(
    () => {
      gsap.from(".faq-item", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".faq-list", start: "top 85%", once: true },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="faq" ref={sectionRef} className="py-24 bg-[#0A0F1C]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-xl text-gray-400">
            Tudo o que você precisa saber antes de começar.
          </p>
        </div>

        <div className="faq-list space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="faq-item bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-white">
                    {faq.question}
                  </span>
                  <Plus
                    className={`w-5 h-5 shrink-0 text-[#3B82F6] transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
