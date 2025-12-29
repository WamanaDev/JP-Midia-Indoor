import Image from "next/image";
import Link from "next/link";

export default function PoliticaDeCookiesPage() {
  return (
    <div className="bg-gray-50 text-black min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-2 rounded-lg">
            <Link href="/">
              <Image
                src="/icons/Icons/logoquadrada2.png"
                alt="JP Dash"
                width={64}
                height={64}
              />
            </Link>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#111827] text-center mb-4">
          Política de Cookies
        </h1>
        <p className="text-center text-gray-500 mb-12">
          Última atualização: 29 de dezembro de 2025
        </p>

        {/* Conteúdo */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              Esta Política de Cookies explica como o <strong>JP Dash</strong>,
              operado pela <strong>JP Mídia Indoor</strong>, utiliza cookies e
              tecnologias semelhantes quando você acessa nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              1. O que são cookies
            </h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu
              navegador ou dispositivo quando você visita um site ou aplicativo.
              Eles são utilizados para garantir o funcionamento adequado da
              plataforma, melhorar a experiência do usuário e aumentar a
              segurança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              2. Tipos de cookies utilizados
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Cookies essenciais:</strong> necessários para o
                funcionamento da aplicação, como autenticação, gerenciamento de
                sessões e segurança.
              </li>
              <li>
                <strong>Cookies de funcionalidade:</strong> permitem lembrar
                preferências do usuário e configurações personalizadas.
              </li>
              <li>
                <strong>Cookies de desempenho:</strong> coletam informações
                anônimas para análise e melhoria do sistema.
              </li>
              <li>
                <strong>Cookies de terceiros:</strong> podem ser definidos por
                serviços integrados, como autenticação via Google ou Discord.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              3. Cookies utilizados pelo JP Dash
            </h2>
            <p>
              O JP Dash utiliza cookies principalmente para manter usuários
              autenticados, proteger contas, prevenir acessos não autorizados e
              garantir o correto funcionamento das funcionalidades da
              plataforma.
            </p>
            <p className="mt-2">
              A autenticação é realizada por meio do <strong>Supabase</strong>,
              que utiliza cookies estritamente necessários para gerenciamento
              seguro de sessões.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              4. Gerenciamento de cookies
            </h2>
            <p>
              Você pode configurar seu navegador para bloquear ou alertar sobre
              o uso de cookies. No entanto, a desativação de cookies essenciais
              pode comprometer o funcionamento do JP Dash.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              5. Consentimento
            </h2>
            <p>
              Ao utilizar o JP Dash, você concorda com o uso de cookies conforme
              descrito nesta Política. Quando exigido por lei, poderemos
              solicitar seu consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              6. Alterações nesta Política
            </h2>
            <p>
              Esta Política de Cookies pode ser atualizada periodicamente.
              Recomendamos que você revise este documento regularmente para se
              manter informado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              7. Contato
            </h2>
            <p>
              Em caso de dúvidas sobre esta Política de Cookies, entre em
              contato pelos canais oficiais do <strong>JP Dash</strong>.
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
