import { Building2, MonitorCheck, TimerReset, ShieldCheck } from "lucide-react";
import { Counter } from "@/components/landing/Counter";

const stats = [
  {
    icon: Building2,
    value: 2000,
    suffix: "+",
    label: "Negócios usando mídia digital",
  },
  {
    icon: MonitorCheck,
    value: 99.9,
    suffix: "%",
    decimals: 1,
    label: "Uptime e estabilidade das telas",
  },
  {
    icon: TimerReset,
    value: 24,
    suffix: "/7",
    label: "Monitoramento contínuo",
  },
  {
    icon: ShieldCheck,
    value: 7,
    suffix: " dias",
    label: "De garantia incondicional",
  },
];

export function SocialProof() {
  return (
    <section id="social-proof" className="relative bg-[#05070D] py-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 text-[#3B82F6] mx-auto mb-3" />
              <div className="text-3xl sm:text-4xl font-bold text-white">
                <Counter
                  to={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                />
              </div>
              <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
