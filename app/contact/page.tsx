import { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Fale Conosco",
  description:
    "Entre em contato com a equipe da JP Mídia Indoor. Tire dúvidas sobre planos, funcionalidades ou suporte técnico.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Fale Conosco | JP Mídia Indoor",
    description:
      "Entre em contato com a equipe da JP Mídia Indoor. Tire dúvidas sobre planos, funcionalidades ou suporte técnico.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
