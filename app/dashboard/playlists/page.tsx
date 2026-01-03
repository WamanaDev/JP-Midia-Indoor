import { AccessBlocked } from "@/components/dashboard/AccessBlocked";
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

  // ✅ Bloquear se não tiver acesso
  if (!access.canAccess) {
    const reason = access.isPastDue
      ? "past_due"
      : access.exceededScreens
      ? "exceeded_screens"
      : "exceeded_storage";

    return (
      <AccessBlocked
        reason={reason}
        message={access.message!}
        currentScreens={access.currentScreens}
        maxScreens={access.maxScreens}
        currentStorageGb={access.currentStorageGb}
        maxStorageGb={access.maxStorageGb}
      />
    );
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
    <span>
      <Playlists playlists={playlists} clients={clients} />
    </span>
  );
}
