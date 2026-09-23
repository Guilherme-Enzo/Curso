"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModulesManager from "@/app/components/ModulesManager";
import QuestionsManager from "@/app/components/QuestionsManager";
import ComunidadeTab from "@/app/components/ComunidadeTab";
import { withBasePath } from "@/lib/publicPath";
import SocialIcons from "@/app/components/SocialIcons";
import InstallAppPrompt from "@/app/components/InstallAppPrompt";
import Icon, { type IconName } from "@/app/components/Icon";
import PromptsManager from "@/app/components/PromptsManager";
import { restoreModuleScroll, takeModuleReturn } from "@/lib/moduleNavigation";

type Session = { userId: string; role: string; name: string };

type Tab = "conteudo" | "duvidas" | "comunidade" | "prompts";

export default function TeacherPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("conteudo");
  const [unreadQuestions, setUnreadQuestions] = useState(0);
  const [unreadCommunity, setUnreadCommunity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    function handleClickOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [menuOpen]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(withBasePath("/api/auth/session"));
        if (!res.ok) {
          window.location.href = withBasePath("/login");
          return;
        }
        const data = await res.json();
        if (data?.user?.role !== "teacher") {
          window.location.href = withBasePath("/aluno");
          return;
        }
        setSession({ ...data.user, userId: data.user.id });
      } catch {
        window.location.href = withBasePath("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    async function loadNotificationCounts() {
      const [questionsRes, topicsRes] = await Promise.all([
        fetch(withBasePath("/api/questions")),
        fetch(withBasePath("/api/topics")),
      ]);
      if (!active) return;
      if (questionsRes.ok) {
        const data = await questionsRes.json();
        setUnreadQuestions(data.questions.filter((question: { status: string }) => question.status === "open").length);
      }
      if (topicsRes.ok) {
        const data = await topicsRes.json();
        setUnreadCommunity(data.topics.reduce((total: number, topic: { unreadCount: number }) => total + topic.unreadCount, 0));
      }
    }
    void loadNotificationCounts();
    const timer = window.setInterval(loadNotificationCounts, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [session]);

  useEffect(() => {
    const scrollY = takeModuleReturn("/professor");
    if (scrollY !== null) restoreModuleScroll(scrollY);
  }, []);

  async function handleLogout() {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    window.location.href = withBasePath("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050508] text-sm text-zinc-400">
        Carregando...
      </main>
    );
  }

  const tabs: { key: Tab; label: string; icon: IconName; href?: string }[] = [
    { key: "conteudo", label: "Conteúdo", icon: "book" },
    { key: "prompts", label: "Prompts", icon: "spark" },
    { key: "duvidas", label: "Canal de Dúvidas", icon: "message" },
    { key: "comunidade", label: "Comunidade", icon: "users" },
  ];

  return (
    <main className="min-h-screen bg-[#050508] text-white">
      <InstallAppPrompt />
                  <header className="relative z-50 border-b border-violet-400/30 bg-violet-500/[0.06] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
               <img src="/icofotoia-icon.png" alt="" className="h-7 w-7 rounded-xl shadow-lg shadow-violet-500/30" />
              <span className="text-lg font-bold tracking-tight text-white">
                Retrato <span className="text-white"><span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">I</span>magin<span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">A</span>do</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/perfil"
              className="hidden sm:flex rounded-lg border border-violet-400/25 px-4 py-2 text-base text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="hidden sm:flex rounded-lg border border-red-500/40 px-4 py-2 text-base text-red-400 transition hover:border-red-600 hover:bg-red-500/10 hover:text-red-300"
            >
              Sair
            </button>
            <div ref={menuRef} className="relative sm:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg border border-violet-400/40 px-3 py-2 text-lg text-zinc-300 transition hover:bg-violet-500/[0.12]"
              >
                ⋮
              </button>
              {menuOpen && (
                <>
                  <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-violet-400/30 bg-[#0a0a0f] shadow-2xl">
                    <Link href="/perfil" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-zinc-300 hover:bg-violet-500/10 rounded-t-xl">Perfil</Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl">Sair</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b border-violet-400/30 bg-[#0a0a0f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-3 py-3 sm:px-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => t.href ? window.location.href = t.href : setTab(t.key)}
              className={`flex min-w-max items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                tab === t.key && !t.href
                  ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-zinc-950"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
              {t.key === "duvidas" && unreadQuestions > 0 && <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{unreadQuestions}</span>}
              {t.key === "comunidade" && unreadCommunity > 0 && <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{unreadCommunity}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">
           Colaborador {session?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-base text-zinc-400">
          {tab === "conteudo"
            ? "Crie, organize e acompanhe o conteúdo disponível para os usuários."
            : tab === "duvidas"
                ? "Responda às dúvidas dos usuários sobre estudos, plataforma e questões técnicas."
                : tab === "prompts"
                  ? "Crie e organize prompts para edição e criação de imagens."
                  : "Acompanhe e participe das conversas da comunidade."}
        </p>

        {tab === "conteudo" && <ModulesManager viewer="professor" />}
        {tab === "duvidas" && <QuestionsManager onOpenCountChange={setUnreadQuestions} />}
        {tab === "comunidade" && <ComunidadeTab session={session!} onUnreadCountChange={setUnreadCommunity} />}
        {tab === "prompts" && <PromptsManager />}
      </div>

      <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
         <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
               <img src="/icofotoia-icon.png" alt="" className="h-5 w-5 rounded-lg" />
              <span className="text-xs font-bold text-white">
                Retrato <span className="text-white"><span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">I</span>magin<span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">A</span>do</span>
              </span>
             </div>
             <p className="whitespace-nowrap text-[11px] text-zinc-500 sm:text-sm">Plataforma educacional de prompts de fotografia e edição com IA.</p>
             <SocialIcons />
           </div>
        </div>
      </footer>
    </main>
  );
}
