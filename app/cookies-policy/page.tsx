import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Entenda como a JP Mídia Indoor usa cookies para melhorar sua experiência na plataforma.",
  alternates: { canonical: "/cookies-policy" },
  robots: { index: true, follow: true },
};

export default function PoliticaDeCookiesPage() {
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
          Política de Cookies
        </h1>
        <p className="text-center text-gray-500 mb-12">
          Última atualização: 10 de agosto de 2026
        </p>

        {/* Conteúdo */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <p>
              Esta Política de Cookies explica como a{" "}
              <strong>JP Mídia Indoor</strong> utiliza cookies e tecnologias
              semelhantes quando você acessa nossa plataforma, em
              conformidade com a LGPD (Lei nº 13.709/2018) e o Marco Civil da
              Internet (Lei nº 12.965/2014).
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
                serviços integrados, como autenticação via Google.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              3. Cookies utilizados pela JP Mídia Indoor
            </h2>
            <p>
              A JP Mídia Indoor utiliza cookies principalmente para manter
              usuários autenticados, proteger contas, prevenir acessos não
              autorizados e garantir o correto funcionamento das
              funcionalidades da plataforma.
            </p>
            <p className="mt-2">
              A autenticação é realizada por meio do <strong>Supabase</strong>,
              que utiliza cookies estritamente necessários para gerenciamento
              seguro de sessões. Durante o checkout de assinaturas, a página
              de pagamento hospedada pelo <strong>Stripe</strong> também pode
              definir cookies próprios, necessários para processar o
              pagamento com segurança. Não utilizamos cookies de publicidade
              ou de análise de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              4. Gerenciamento de cookies
            </h2>
            <p>
              Você pode configurar seu navegador para bloquear ou alertar sobre
              o uso de cookies. No entanto, a desativação de cookies essenciais
              pode comprometer o funcionamento da JP Mídia Indoor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              5. Consentimento
            </h2>
            <p>
              Ao utilizar a JP Mídia Indoor, você concorda com o uso de
              cookies conforme descrito nesta Política. Quando exigido por
              lei, poderemos solicitar seu consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              6. Alterações nesta Política
            </h2>
            <p>
              Esta Política de Cookies pode ser atualizada periodicamente.
              Recomendamos que você revise este documento regularmente para
              se manter informado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              7. Contato
            </h2>
            <p>
              Em caso de dúvidas sobre esta Política de Cookies, entre em
              contato:
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
