import { UpdateCardForm } from "@/components/dashboard/subscriptions/UpdateCardForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    client_secret?: string;
  }>;
}

export default async function UpdateCardPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // ✅ Await searchParams
  const params = await searchParams;
  const clientSecret = params.client_secret;

  if (!clientSecret) {
    redirect("/dashboard/subscriptions");
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827] dark:text-white mb-2">
          Atualizar Método de Pagamento
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Adicione ou atualize seu cartão de crédito para continuar usando os
          recursos premium.
        </p>
      </div>

      <UpdateCardForm clientSecret={clientSecret} />
    </div>
  );
}
