import { AccessBlocked } from "@/components/dashboard/AccessBlocked";
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

  const [screens, clients, playlists] = await Promise.all([
    supabase
      .from("screens")
      .select("*, playlist:playlists (name)")
      .eq("user_id", session.user.id),
    supabase.from("clients").select("*").eq("user_id", session.user.id),
    supabase.from("playlists").select("*").eq("user_id", session.user.id),
  ]);

  return (
    <Screens
      screens={screens.data}
      clients={clients.data}
      playlists={playlists.data}
    />
  );
}
