import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const OG_URL = "http://cgcurso.eastus.cloudapp.azure.com/fotoia/og-image.jpg";

export const metadata: Metadata = {
  title: "Retrato ImAginado — Prompts de Fotografia e Edição com IA",
  description: "Domine a arte de criar imagens incríveis usando Inteligência Artificial. Aprenda prompts para Midjourney, DALL-E, Stable Diffusion e mais.",
  openGraph: {
    title: "Retrato ImAginado — Prompts de Fotografia e Edição com IA",
    description: "Plataforma educacional de prompts de fotografia e edição com IA. Aprenda Midjourney, DALL-E, Stable Diffusion e mais.",
    url: "http://cgcurso.eastus.cloudapp.azure.com/fotoia",
    siteName: "Retrato ImAginado",
    images: [{ url: OG_URL, width: 1200, height: 630, alt: "Retrato ImAginado - Prompts de Fotografia e Edição com IA" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retrato ImAginado — Prompts de Fotografia e Edição com IA",
    description: "Aprenda prompts de fotografia e edição com IA. Do básico ao avançado.",
    images: [OG_URL],
  },
  metadataBase: new URL("http://cgcurso.eastus.cloudapp.azure.com/fotoia"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="blue" data-grid="16" className={"${geistSans.variable} ${geistMono.variable} h-full antialiased"}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white">{children}</body>
    </html>
  );
}
