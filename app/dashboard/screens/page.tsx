import { Screens } from "@/components/dashboard/screens/Screens";
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
