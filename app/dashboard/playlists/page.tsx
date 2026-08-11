import { AccessBlocked } from "@/components/dashboard/AccessBlocked";
import { OverLimitBanner } from "@/components/dashboard/OverLimitBanner";
import { Playlists } from "@/components/dashboard/playlists/Playlists";
import { checkSubscriptionAccess } from "@/lib/stripe/subscription-guard";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "JP Mídia - Playlists",
};

export default async function PlaylistsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // ✅ Verificar acesso
  const access = await checkSubscriptionAccess(session.user.id);

  // ✅ Pagamento pendente continua bloqueando por completo. Limite de telas
  // ou armazenamento excedido não impede playlists (são ilimitadas em todo
  // plano) — só mostra um aviso.
  if (access.isPastDue) {
    return <AccessBlocked reason="past_due" message={access.message!} />;
  }

  const [
    { data: playlists, error: playlistsError },
    { data: clients, error: clientsError },
  ] = await Promise.all([
    supabase
      .from("playlists")
      .select(
        `
      *,
      playlist_items(id),
      screens(id, name)
    `
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("clients")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_active", true),
  ]);

  if (playlistsError) throw playlistsError;
  if (clientsError) throw clientsError;

  return (
    <>
      {!access.canAccess && <OverLimitBanner message={access.message!} />}
      <Playlists playlists={playlists} clients={clients} />
    </>
  );
}
