import Link from "next/link";
import SocialIcons from "./SocialIcons";

export default function SiteFooter({ backHref }: { backHref?: string }) {
  return (
    <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-8 text-center sm:px-6">
        <div className="flex items-center gap-2">
          <img src="/icofotoia-icon.png" alt="" className="h-6 w-6 rounded-lg" />
          <span className="text-sm font-bold text-white">Retrato <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">ImaginAdo</span></span>
        </div>
        <p className="whitespace-nowrap text-[11px] text-zinc-500 sm:text-sm">Plataforma educacional de prompts de fotografia e edição com IA.</p>
        {backHref && <Link href={backHref} className="text-sm text-zinc-400 transition hover:text-white">Voltar</Link>}
        <SocialIcons />
        <div className="w-full border-t border-violet-400/20 pt-4">
        <p className="whitespace-nowrap text-[11px] text-zinc-500 sm:text-sm">© {new Date().getFullYear()} Retrato ImaginAdo. Prompts de Fotografia e Edição com IA</p>
        </div>
      </div>
    </footer>
  );
}
