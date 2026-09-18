import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const OG_URL = "http://cgcurso.eastus.cloudapp.azure.com/og-image.jpg";

export const metadata: Metadata = {
  title: "Auto Elétrica | Injeção Eletrônica Automotiva",
  description: "Auto Elétrica — elétrica e injeção eletrônica automotiva do zero ao avançado. Plataforma educacional completa com IA integrada.",
  openGraph: {
    title: "Auto Elétrica | Injeção Eletrônica Automotiva",
    description: "Plataforma educacional de elétrica e injeção eletrônica automotiva. Do fundamento ao diagnóstico avançado, com IA integrada.",
    url: "http://cgcurso.eastus.cloudapp.azure.com",
    siteName: "Auto Elétrica",
    images: [{ url: OG_URL, width: 1200, height: 630, alt: "Auto Elétrica - Injeção Eletrônica Automotiva" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Elétrica | Injeção Eletrônica Automotiva",
    description: "Plataforma educacional de elétrica e injeção eletrônica automotiva com IA integrada.",
    images: [OG_URL],
  },
  metadataBase: new URL("http://cgcurso.eastus.cloudapp.azure.com"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-theme="blue" data-grid="16" className={"${geistSans.variable} ${geistMono.variable} h-full antialiased"}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
