import { Monitor, Layers, BarChart3, Clock, Shield, Zap } from "lucide-react";

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
  return (
    <section id="features" className="py-24 bg-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#111827] mb-4">
            Tecnologia feita para escalar
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Potencialize sua comunicação visual com ferramentas profissionais,
            rápidas e seguras — tudo em um único lugar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#3B82F6] group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-semibold text-[#111827] mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
