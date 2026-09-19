import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = "https://retratoimaginado.cgialabs.com.br";
const OG_URL = `${SITE_URL}/logofotoia.jpg`;

export const metadata: Metadata = {
  title: "Retrato ImaginAdo — Prompts de Fotografia e Edição com IA",
  description: "Domine a arte de criar imagens incríveis usando Inteligência Artificial. Aprenda prompts para Midjourney, DALL-E, Stable Diffusion e mais.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Retrato ImaginAdo — Prompts de Fotografia e Edição com IA",
    description: "Plataforma educacional de prompts de fotografia e edição com IA. Aprenda Midjourney, DALL-E, Stable Diffusion e mais.",
    url: SITE_URL,
    siteName: "Retrato ImaginAdo",
    images: [{ url: OG_URL, width: 1200, height: 630, alt: "Retrato ImaginAdo - Prompts de Fotografia e Edição com IA" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retrato ImaginAdo — Prompts de Fotografia e Edição com IA",
    description: "Aprenda prompts de fotografia e edição com IA. Do básico ao avançado.",
    images: [OG_URL],
  },
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="blue" data-grid="16" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white">{children}</body>
    </html>
  );
}
