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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jpmidia.wamanadev.com.br";

const SITE_NAME = "JP Mídia Indoor";
const SITE_DESCRIPTION =
  "Plataforma de mídia indoor para gerenciar telas digitais em tempo real: playlists de imagem, vídeo e PDF, além de overlays de clima, hora e notícias. Comece grátis, sem cartão de crédito.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Gestão de telas digitais e comunicação visual`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "mídia indoor",
    "sinalização digital",
    "digital signage",
    "gestão de telas digitais",
    "TV corporativa",
    "playlist de mídia",
    "comunicação visual",
    "automação de telas",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: "JP Mídia Indoor" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Gestão de telas digitais e comunicação visual`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Gestão de telas digitais e comunicação visual`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  verification: {
    google: "i_nZnDoIDM9dnl3zcFozhbTg9-y3Q8_CR-blejQYWAk",
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
    <html lang="pt-BR" suppressHydrationWarning>
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
