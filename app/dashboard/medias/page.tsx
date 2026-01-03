import { AccessBlocked } from "@/components/dashboard/AccessBlocked";
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

  const [medias] = await Promise.all([
    supabase
      .from("media_files")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false }),
  ]);

  return <Medias medias={medias.data} />;
}
