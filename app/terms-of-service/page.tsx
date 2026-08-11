"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="bg-gray-50 text-black min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#3B82F6] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-2 rounded-lg">
            <Link href="/">
              <Image
                src="/icons/Icons/logoquadrada2.png"
                alt="JP Mídia Indoor"
                width={64}
                height={64}
              />
            </Link>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#111827] text-center mb-4">
          Termos de Serviço
        </h1>
        <p className="text-center text-gray-500 mb-12">
          Última atualização: 10 de agosto de 2026
        </p>

        {/* Conteúdo */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              Bem-vindo à <strong>JP Mídia Indoor</strong>. Estes Termos de
              Serviço regulam o uso da nossa plataforma e são regidos pela
              legislação brasileira, incluindo o{" "}
              <strong>
                Código de Defesa do Consumidor (Lei nº 8.078/1990)
              </strong>{" "}
              e o <strong>Decreto nº 7.962/2013</strong>, que regulamenta a
              contratação no comércio eletrônico. Ao acessar ou utilizar a JP
              Mídia Indoor, você concorda integralmente com estes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              1. Identificação do fornecedor
            </h2>
            <p>
              A JP Mídia Indoor é operada por Wictor Pamplona / 43251070886.
              Canal eletrônico de atendimento: contato@wamanadev.com.br.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              2. Aceitação dos Termos
            </h2>
            <p>
              Ao criar uma conta ou utilizar qualquer funcionalidade da
              plataforma, você declara que leu, compreendeu e concorda com estes
              Termos de Serviço e com a Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              3. Sobre o serviço
            </h2>
            <p>
              A JP Mídia Indoor é uma plataforma de gerenciamento de conteúdos
              digitais, permitindo a organização de telas, playlists, mídias e
              usuários, com recursos de autenticação e personalização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              4. Cadastro e conta
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Você é responsável pelas informações fornecidas no cadastro
              </li>
              <li>É proibido compartilhar suas credenciais de acesso</li>
              <li>Você deve manter seus dados atualizados</li>
              <li>O uso da conta é pessoal e intransferível</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              5. Login social
            </h2>
            <p>
              A JP Mídia Indoor permite login via <strong>Google</strong>. Ao
              optar por esse método, você autoriza o recebimento das informações
              necessárias para autenticação, de acordo com as políticas desse
              serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              6. Planos, assinatura e pagamento
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Oferecemos um plano gratuito (Freemium) e planos pagos (Starter
                e Professional), com preços exibidos na página de planos. O
                plano Enterprise possui preço personalizado, definido em contato
                comercial direto
              </li>
              <li>
                Os planos pagos incluem um período de teste gratuito de 7 dias.
                É necessário informar um cartão de crédito válido para iniciar o
                teste
              </li>
              <li>
                Ao final do período de teste, a cobrança do valor do plano
                escolhido é feita automaticamente, de forma recorrente (mensal),
                salvo cancelamento anterior ao término do teste
              </li>
              <li>
                Os pagamentos são processados integralmente pelo{" "}
                <strong>Stripe</strong>. A JP Mídia Indoor não tem acesso e não
                armazena os dados completos do seu cartão
              </li>
              <li>
                Preços podem ser reajustados mediante aviso prévio, sem efeito
                retroativo sobre cobranças já realizadas
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              7. Cancelamento e direito de arrependimento
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Você pode cancelar sua assinatura a qualquer momento, de forma
                self-service, na página &quot;Minha Assinatura&quot; do
                painel — pelo mesmo canal usado para contratar, conforme o
                Decreto nº 11.034/2022. O cancelamento tem efeito imediato
                sobre cobranças futuras, mas você mantém acesso ao plano pago
                até o fim do ciclo já pago, sem reembolso proporcional pelo
                tempo não utilizado nesse caso
              </li>
              <li>
                Nos termos do{" "}
                <strong>art. 49 do Código de Defesa do Consumidor</strong>, por
                se tratar de contratação feita fora do estabelecimento comercial
                (pela internet), você tem direito de se arrepender da
                contratação em até <strong>7 (sete) dias corridos</strong> a
                contar da cobrança, com direito a reembolso integral e sem
                qualquer custo adicional. Esse pedido também pode ser feito
                self-service, pela mesma página &quot;Minha Assinatura&quot;,
                que cancela a assinatura e devolve o valor pago de forma
                automática
              </li>
              <li>
                Caso prefira, ou em caso de qualquer problema com o
                cancelamento pelo painel, você também pode solicitar o
                cancelamento ou o reembolso pelo e-mail
                contato@wamanadev.com.br, com resposta em até 7 (sete) dias
                úteis, conforme o Decreto nº 11.034/2022
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              8. Uso permitido
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar a plataforma de forma legal e ética</li>
              <li>Não tentar acessar áreas restritas sem autorização</li>
              <li>Não realizar engenharia reversa ou exploração indevida</li>
              <li>Não utilizar o serviço para fins ilícitos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              9. Conteúdo do usuário e dados de terceiros
            </h2>
            <p>
              Você é o único responsável pelos conteúdos que cria, envia ou
              gerencia na plataforma, incluindo dados de clientes ou terceiros
              que cadastrar (como CNPJ e razão social no módulo
              &quot;Clientes&quot;). Nesses casos, você atua como controlador
              desses dados perante a LGPD e é responsável por ter base legal
              válida para tratá-los. A JP Mídia Indoor não se responsabiliza por
              conteúdos ilegais, ofensivos ou que violem direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              10. Suspensão e encerramento
            </h2>
            <p>
              Reservamo-nos o direito de suspender ou encerrar contas que violem
              estes Termos, sem aviso prévio, quando necessário para garantir a
              segurança da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              11. Limitação de responsabilidade
            </h2>
            <p>
              A JP Mídia Indoor é fornecida &quot;como está&quot;. Não
              garantimos que o serviço estará sempre disponível ou livre de
              erros. Não nos responsabilizamos por danos diretos ou indiretos
              decorrentes do uso da plataforma, ressalvados os casos de dolo ou
              culpa grave, nos termos da lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              12. Alterações no serviço e nos Termos
            </h2>
            <p>
              Podemos modificar, suspender ou descontinuar funcionalidades da JP
              Mídia Indoor, assim como atualizar estes Termos periodicamente,
              visando melhorias, ajustes técnicos ou adequação legal.
              Recomendamos que você revise este documento regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              13. Lei aplicável e foro
            </h2>
            <p>
              Estes Termos são regidos pela legislação brasileira. Fica eleito o
              foro do domicílio do consumidor para dirimir eventuais
              controvérsias, conforme o art. 101, I, do Código de Defesa do
              Consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              14. Contato
            </h2>
            <p>
              Em caso de dúvidas sobre estes Termos, entre em contato:
              <br />
              <strong>E-mail:</strong> contato@wamanadev.com.br
            </p>
          </section>
        </div>

        {/* Rodapé */}
        <div className="mt-12 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} JP Mídia Indoor • Todos os direitos
          reservados
        </div>
      </div>
    </div>
  );
}
