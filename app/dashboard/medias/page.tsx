import { AccessBlocked } from "@/components/dashboard/AccessBlocked";
import { OverLimitBanner } from "@/components/dashboard/OverLimitBanner";
import { Medias } from "@/components/dashboard/medias/Medias";
import { checkSubscriptionAccess } from "@/lib/stripe/subscription-guard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function PageMedias() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("auth/signin");
  }

  // ✅ Verificar acesso
  const access = await checkSubscriptionAccess(session.user.id);

  // ✅ Pagamento pendente continua bloqueando por completo — isso não se
  // resolve apagando recursos. Limite excedido só mostra um aviso, pois o
  // usuário precisa entrar aqui para apagar mídias e voltar dentro do limite.
  if (access.isPastDue) {
    return <AccessBlocked reason="past_due" message={access.message!} />;
  }

  const [medias] = await Promise.all([
    supabase
      .from("media_files")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      {!access.canAccess && <OverLimitBanner message={access.message!} />}
      <Medias
        medias={medias.data}
        currentStorageGb={access.currentStorageGb}
        maxStorageGb={access.maxStorageGb}
      />
    </>
  );
}
