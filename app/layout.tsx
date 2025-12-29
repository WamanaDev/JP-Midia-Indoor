import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JP Mídia Indoor",
  description:
    "A nova identidade visual da JP Mídia une tecnologia, automação e confiabilidade em uma experiência moderna para dashboards e mídia indoor.",
  keywords:
    "JP Mídia, mídia indoor, automação, dashboard, identidade visual, tecnologia, PWA, design system, telas digitais",
  openGraph: {
    type: "website",
    url: "https://jpmidia.com/",
    title: "JP Mídia — Automação e Mídia Indoor com Tecnologia",
    description:
      "Identidade visual moderna para uma plataforma inteligente de mídia indoor. Eficiência, conectividade e design escalável.",
    images: [
      {
        url: "https://jpmidia.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@jpmidia",
    title: "JP Mídia — Automação e Mídia Indoor",
    description:
      "Tecnologia, dados e automação em uma identidade visual moderna e intuitiva.",
    images: ["https://jpmidia.com/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icons/favicos/favico16x16.png", sizes: "16x16" },
      { url: "/icons/favicos/favico32x32.png", sizes: "32x32" },
      { url: "/icons/favicos/favico192x192.png", sizes: "192x192" },
    ],
    apple: "/icons/favicos/favico512x512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
