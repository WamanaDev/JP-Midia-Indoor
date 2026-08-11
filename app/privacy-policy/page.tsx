"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          Política de Privacidade
        </h1>
        <p className="text-center text-gray-500 mb-12">
          Última atualização: 10 de agosto de 2026
        </p>

        {/* Conteúdo */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              A <strong>JP Mídia Indoor</strong> respeita a sua privacidade e
              está comprometida com a proteção dos seus dados pessoais, em
              conformidade com a{" "}
              <strong>
                Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)
              </strong>{" "}
              e com o{" "}
              <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong>.
              Esta Política explica quais dados coletamos, para quê os usamos,
              por quanto tempo os guardamos e com quem podemos compartilhá-los.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              1. Quem somos
            </h2>
            <p>
              A JP Mídia Indoor é uma plataforma digital voltada ao
              gerenciamento de conteúdos, telas, playlists e mídias digitais,
              oferecendo recursos de autenticação, personalização e integração
              com serviços de terceiros.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Operador responsável: Wictor Pamplona / 43251070886. Enquanto essa
              formalização não é concluída, o canal de contato abaixo é o meio
              oficial para exercício de direitos e dúvidas sobre esta Política.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              2. Dados que coletamos
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Dados de cadastro:</strong> nome completo, e-mail e
                senha (armazenada de forma criptografada)
              </li>
              <li>
                <strong>Login social:</strong> nome, e-mail e foto de perfil
                fornecidos pelo Google, quando você opta por esse método
              </li>
              <li>
                <strong>Dados de pagamento:</strong> nome do titular do cartão e
                identificadores de cobrança processados pelo{" "}
                <strong>Stripe</strong>. Nós não armazenamos o número do seu
                cartão em nossos servidores
              </li>
              <li>
                <strong>Dados de uso da plataforma:</strong> telas, playlists e
                arquivos de mídia (imagens, vídeos, PDFs) que você cadastra e
                faz upload
              </li>
              <li>
                <strong>Dados de clientes que você cadastra:</strong> quando
                você usa o módulo &quot;Clientes&quot;, armazenamos os dados que
                você insere sobre os seus próprios clientes (nome, razão social
                e CNPJ). Nesse caso você é o controlador desses dados perante a
                LGPD, e a JP Mídia Indoor atua apenas como operadora a seu
                pedido
              </li>
              <li>
                <strong>Formulário de contato:</strong> nome, e-mail, telefone
                (opcional) e mensagem enviados por você
              </li>
              <li>
                <strong>Dados de sessão, autenticação, IP e navegação:</strong>{" "}
                coletados automaticamente para garantir segurança e o
                funcionamento da plataforma
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              3. Finalidade e base legal do tratamento
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Execução de contrato</strong> (art. 7º, V, LGPD): criar
                e gerenciar sua conta, processar assinaturas e cobranças,
                entregar as funcionalidades da plataforma
              </li>
              <li>
                <strong>Cumprimento de obrigação legal</strong> (art. 7º, II,
                LGPD): guarda de registros de acesso por 6 meses, conforme exige
                o art. 15 do Marco Civil da Internet
              </li>
              <li>
                <strong>Legítimo interesse</strong> (art. 7º, IX, LGPD):
                prevenção a fraudes e garantia da segurança da plataforma
              </li>
              <li>
                <strong>Consentimento</strong> (art. 7º, I, LGPD): quando você
                envia uma mensagem pelo formulário de contato
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              4. Armazenamento e segurança
            </h2>
            <p>
              Utilizamos os seguintes fornecedores, todos com práticas modernas
              de segurança e criptografia, para operar a plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Supabase:</strong> banco de dados e autenticação
              </li>
              <li>
                <strong>Cloudflare R2:</strong> armazenamento dos arquivos de
                mídia enviados (imagens, vídeos, PDFs)
              </li>
              <li>
                <strong>Stripe:</strong> processamento de pagamentos e dados de
                cobrança
              </li>
              <li>
                <strong>Resend:</strong> envio de e-mails transacionais e do
                formulário de contato
              </li>
              <li>
                <strong>Google:</strong> autenticação via login social
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              5. Retenção de dados
            </h2>
            <p>
              Mantemos seus dados de conta enquanto ela estiver ativa. Os
              registros de acesso à aplicação são mantidos por 6 (seis) meses,
              prazo mínimo exigido pelo art. 15 do Marco Civil da Internet, e só
              são divulgados a terceiros mediante ordem judicial. Dados de
              cobrança podem ser mantidos por prazo adicional para cumprimento
              de obrigações fiscais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              6. Compartilhamento de dados
            </h2>
            <p>
              Seus dados não são vendidos. Compartilhamos dados apenas com os
              operadores listados na seção 4 (Supabase, Cloudflare, Stripe,
              Resend e Google), na medida necessária para prestar o serviço, ou
              quando exigido por lei ou ordem judicial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              7. Cookies
            </h2>
            <p>
              Utilizamos cookies para manter sua sessão ativa e garantir o
              funcionamento correto da autenticação. Detalhes completos estão na
              nossa{" "}
              <Link
                href="/cookies-policy"
                className="text-[#3B82F6] hover:underline"
              >
                Política de Cookies
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              8. Seus direitos (art. 18 da LGPD)
            </h2>
            <p>Você pode, a qualquer momento e mediante solicitação:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Confirmar se tratamos seus dados pessoais</li>
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>
                Solicitar anonimização, bloqueio ou eliminação de dados
                desnecessários ou tratados em desconformidade com a lei
              </li>
              <li>
                Solicitar a portabilidade dos seus dados a outro fornecedor
              </li>
              <li>
                Solicitar a eliminação dos dados tratados com base no seu
                consentimento
              </li>
              <li>Obter informação sobre com quem compartilhamos seus dados</li>
              <li>Revogar seu consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer um desses direitos, entre em contato pelo
              canal indicado na seção 11.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              9. Exclusão da conta
            </h2>
            <p>
              Você pode solicitar a exclusão da sua conta a qualquer momento.
              Após a exclusão, seus dados serão removidos ou anonimizados,
              respeitando as obrigações legais de retenção descritas na seção 5.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              10. Comunicações
            </h2>
            <p>
              Enviamos apenas comunicações essenciais, como confirmação de
              cadastro, redefinição de senha, avisos de cobrança e alertas de
              segurança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              11. Encarregado (DPO) e contato
            </h2>
            <p>
              Em caso de dúvidas, solicitações ou exercício dos direitos
              descritos nesta Política, entre em contato com o nosso encarregado
              pelo tratamento de dados:
              <br />
              <strong>E-mail:</strong> contato@wamanadev.com.br
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              12. Alterações desta Política
            </h2>
            <p>
              Esta Política pode ser atualizada periodicamente para refletir
              mudanças na plataforma ou na legislação. Recomendamos revisá-la
              regularmente.
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
