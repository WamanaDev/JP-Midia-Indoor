import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Plans } from "@/components/landing/Plans";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log(session?.user.id);

  const [profile, plans] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", session?.user.id).single(),
    supabase.from("plans").select("*").order("price", { ascending: true }),
  ]);

  const userExists = !!session?.user; // transforma em booleano

  return (
    <div className="min-h-screen bg-white">
      <Header user={userExists} />
      <div className="pt-20">
        <Hero user={userExists} />
        <Features />
        <About />
        <Plans profile={profile.data} plans={plans.data} user={userExists} />
        <CTA user={userExists} />
        <Footer />
      </div>
    </div>
  );
}
