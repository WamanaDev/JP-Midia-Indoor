"use client";

import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 text-black min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-2 rounded-lg">
            <Image
              src="/icons/Icons/logoquadrada2.png"
              alt="JP Dash"
              width={64}
              height={64}
            />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#111827] text-center mb-4">
          Política de Privacidade
        </h1>
        <p className="text-center text-gray-500 mb-12">
          Última atualização: 29 de dezembro de 2025
        </p>

        {/* Conteúdo */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              A <strong>JP Dash</strong>, operada pela <strong>JP Mídia</strong>
              , respeita a sua privacidade e está comprometida com a proteção
              dos seus dados pessoais. Esta Política explica como coletamos,
              utilizamos e protegemos suas informações ao utilizar nossa
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              1. Quem somos
            </h2>
            <p>
              O JP Dash é uma plataforma digital voltada ao gerenciamento de
              conteúdos, telas, playlists e mídias digitais, oferecendo recursos
              de autenticação, personalização e integração com serviços de
              terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              2. Dados que coletamos
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Senha (armazenada de forma criptografada)</li>
              <li>Informações de perfil</li>
              <li>Dados de sessão e autenticação</li>
              <li>Endereço IP e informações de navegação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              3. Login social
            </h2>
            <p>
              Caso você utilize login via <strong>Google</strong> ou{" "}
              <strong>Discord</strong>, poderemos receber informações básicas
              como nome, e-mail e foto de perfil, fornecidas diretamente por
              esses serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              4. Como usamos seus dados
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criar e gerenciar sua conta</li>
              <li>Autenticar acessos com segurança</li>
              <li>Personalizar sua experiência</li>
              <li>Enviar comunicações essenciais</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              5. Armazenamento e segurança
            </h2>
            <p>
              Utilizamos a infraestrutura do <strong>Supabase</strong>, que
              adota práticas modernas de segurança, incluindo criptografia e
              controle de acesso, para proteger seus dados contra acessos não
              autorizados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              6. Compartilhamento de dados
            </h2>
            <p>
              Seus dados não são vendidos ou compartilhados para fins
              comerciais. O compartilhamento ocorre apenas quando necessário
              para o funcionamento da plataforma ou cumprimento de obrigações
              legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              7. Cookies
            </h2>
            <p>
              Utilizamos cookies para manter sua sessão ativa, garantir o
              funcionamento correto da autenticação e melhorar sua experiência
              de uso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              8. Seus direitos
            </h2>
            <p>
              De acordo com a LGPD, você pode solicitar acesso, correção ou
              exclusão dos seus dados pessoais, bem como revogar consentimentos
              a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              9. Exclusão da conta
            </h2>
            <p>
              Você pode solicitar a exclusão da sua conta a qualquer momento.
              Após a exclusão, seus dados serão removidos ou anonimizados,
              respeitando obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              10. Comunicações
            </h2>
            <p>
              Enviamos apenas comunicações essenciais, como confirmação de
              cadastro, redefinição de senha e alertas de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              11. Contato
            </h2>
            <p>
              Em caso de dúvidas ou solicitações, entre em contato:
              <br />
              <strong>E-mail:</strong> contato@jpmidia.com
            </p>
          </section>
        </div>

        {/* Rodapé */}
        <div className="mt-12 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} JP Mídia • Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}
