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
          Última atualização: 29 de dezembro de 2025
        </p>

        {/* Conteúdo */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              Bem-vindo à <strong>JP Mídia Indoor</strong>. Estes Termos de
              Serviço regulam o uso da nossa plataforma. Ao acessar ou
              utilizar a JP Mídia Indoor, você concorda integralmente com
              estes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao criar uma conta ou utilizar qualquer funcionalidade da
              plataforma, você declara que leu, compreendeu e concorda com estes
              Termos de Serviço e com a Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              2. Sobre o serviço
            </h2>
            <p>
              A JP Mídia Indoor é uma plataforma de gerenciamento de
              conteúdos digitais, permitindo a organização de telas,
              playlists, mídias e usuários, com recursos de autenticação e
              personalização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              3. Cadastro e conta
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
              4. Login social
            </h2>
            <p>
              A JP Mídia Indoor permite login via <strong>Google</strong>. Ao
              optar por esse método, você autoriza o recebimento das
              informações necessárias para autenticação, de acordo com as
              políticas desse serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              5. Uso permitido
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
              6. Conteúdo do usuário
            </h2>
            <p>
              Você é o único responsável pelos conteúdos que cria, envia ou
              gerencia na plataforma. A JP Mídia Indoor não se responsabiliza
              por conteúdos ilegais, ofensivos ou que violem direitos de
              terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              7. Suspensão e encerramento
            </h2>
            <p>
              Reservamo-nos o direito de suspender ou encerrar contas que violem
              estes Termos, sem aviso prévio, quando necessário para garantir a
              segurança da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              8. Limitação de responsabilidade
            </h2>
            <p>
              A JP Mídia Indoor é fornecida &quot;como está&quot;. Não
              garantimos que o serviço estará sempre disponível ou livre de
              erros. Não nos responsabilizamos por danos diretos ou indiretos
              decorrentes do uso da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              9. Alterações no serviço
            </h2>
            <p>
              Podemos modificar, suspender ou descontinuar funcionalidades da
              JP Mídia Indoor a qualquer momento, visando melhorias ou
              ajustes técnicos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              10. Alterações nos Termos
            </h2>
            <p>
              Estes Termos podem ser atualizados periodicamente. Recomendamos
              que você revise este documento regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              11. Contato
            </h2>
            <p>
              Em caso de dúvidas sobre estes Termos, entre em contato:
              <br />
              <strong>E-mail:</strong> contato@jpmidia.com
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
