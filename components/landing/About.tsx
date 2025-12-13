import { TrendingUp, Users, Smartphone, Globe } from "lucide-react";

export function About() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* TEXTOS */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#111827] mb-6">
              Transforme seu espaço com Mídia Indoor
            </h2>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
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
                Uma solução ideal para lojas, restaurantes, academias, clínicas,
                escritórios e qualquer negócio que deseja transmitir
                profissionalismo e elevar a experiência do cliente.
              </p>
            </div>

            {/* MÉTRICAS */}
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#3B82F6] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#ffffff]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#111827] mb-2">+45%</h3>
                <p className="text-gray-600">Mais atenção e engajamento</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#10B981] bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#ffffff]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#111827] mb-2">
                  +2000
                </h3>
                <p className="text-gray-600">
                  Negócios que já utilizam mídia digital
                </p>
              </div>
            </div>
          </div>

          {/* CARTÕES */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-2xl p-8 text-white">
                  <Smartphone className="w-12 h-12 mb-4 opacity-80" />
                  <h4 className="text-xl font-semibold mb-2">Controle Total</h4>
                  <p className="text-gray-200">
                    Gerencie todas as telas do seu negócio pelo celular ou
                    computador
                  </p>
                </div>

                <div className="bg-[#F3F4F6] rounded-2xl p-8">
                  <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-[#111827]">
                    Cloud First
                  </h4>
                  <p className="text-gray-600">
                    Infraestrutura moderna, rápida e pronta para escalar
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-12">
                <div className="bg-[#FACC15] rounded-2xl p-8">
                  <div className="text-4xl font-bold text-[#1E3A8A] mb-2">
                    99.9%
                  </div>
                  <p className="text-[#1E3A8A] font-medium">
                    Uptime e estabilidade que seu negócio exige
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl p-8 text-white">
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
