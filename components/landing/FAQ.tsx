"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { faqs } from "./faq-data";

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
