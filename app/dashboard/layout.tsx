import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "./DashboardShell";
import { PlayerProvider } from "@/context/PlayerContext";
import { PlayerOverlay } from "@/components/preview/player";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <>
      <PlayerProvider>
        <DashboardShell>{children}</DashboardShell>
        <PlayerOverlay />
      </PlayerProvider>
    </>
  );
}
