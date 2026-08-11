import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { FAQ } from "@/components/landing/FAQ";
import { faqs } from "@/components/landing/faq-data";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Plans } from "@/components/landing/Plans";
import { SocialProof } from "@/components/landing/SocialProof";
import { createClient } from "@/utils/supabase/server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jpmidia.wamanadev.com.br";

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

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JP Mídia Indoor",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/Icons/logoquadrada.png`,
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JP Mídia Indoor",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android TV",
    url: SITE_URL,
    description:
      "Plataforma de mídia indoor para gerenciar telas digitais em tempo real: playlists de imagem, vídeo e PDF, além de overlays de clima, hora e notícias.",
    offers: (plans.data ?? [])
      .filter((plan) => plan.price !== null)
      .map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.price,
        priceCurrency: "BRL",
        url: `${SITE_URL}/pricing`,
      })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#05070D]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header user={userExists} />
      <div>
        <Hero user={userExists} />
        <SocialProof />
        <Features />
        <About />
        <Plans profile={profile.data} plans={plans.data} user={userExists} />
        <FAQ />
        <CTA user={userExists} />
        <Footer />
      </div>
    </div>
  );
}
