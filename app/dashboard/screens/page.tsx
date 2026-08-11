import { AccessBlocked } from "@/components/dashboard/AccessBlocked";
import { OverLimitBanner } from "@/components/dashboard/OverLimitBanner";
import { Screens } from "@/components/dashboard/screens/Screens";
import { checkSubscriptionAccess } from "@/lib/stripe/subscription-guard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ScreensPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // ✅ Verificar acesso
  const access = await checkSubscriptionAccess(session.user.id);

  // ✅ Pagamento pendente continua bloqueando por completo — isso não se
  // resolve apagando recursos. Limite excedido só mostra um aviso, pois o
  // usuário precisa entrar aqui para apagar telas e voltar dentro do limite.
  if (access.isPastDue) {
    return <AccessBlocked reason="past_due" message={access.message!} />;
  }

  const [screens, clients, playlists] = await Promise.all([
    supabase
      .from("screens")
      .select("*, playlist:playlists (name)")
      .eq("user_id", session.user.id),
    supabase.from("clients").select("*").eq("user_id", session.user.id),
    supabase.from("playlists").select("*").eq("user_id", session.user.id),
  ]);

  return (
    <>
      {!access.canAccess && <OverLimitBanner message={access.message!} />}
      <Screens
        screens={screens.data}
        clients={clients.data}
        playlists={playlists.data}
        currentScreens={access.currentScreens}
        maxScreens={access.maxScreens}
      />
    </>
  );
}
