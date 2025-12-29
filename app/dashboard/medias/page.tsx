import { Medias } from "@/components/dashboard/medias/Medias";
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

  const [medias] = await Promise.all([
    supabase
      .from("media_files")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false }),
  ]);
  return <Medias medias={medias.data} />;
}
