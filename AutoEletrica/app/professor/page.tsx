"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModulesManager from "@/app/components/ModulesManager";
import QuestionsManager from "@/app/components/QuestionsManager";
import ConteudoViewer from "@/app/components/ConteudoViewer";
import ComunidadeTab from "@/app/components/ComunidadeTab";

type Session = { userId: string; role: string; name: string };

type Tab = "conteudo" | "materiais" | "duvidas" | "comunidade";

export default function TeacherPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("materiais");

  
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (data?.user?.role !== "teacher") {
          router.replace("/aluno");
          return;
        }
        setSession(data.user);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050508] text-sm text-zinc-400">
        Carregando...
      </main>
    );
  }

  const tabs: { key: Tab; label: string; icon: string; href?: string }[] = [
    { key: "conteudo", label: "Conteúdo", icon: "📚" },
    { key: "materiais", label: "Materiais", icon: "📤" },
    { key: "duvidas", label: "Canal de Dúvidas", icon: "💬" },
    { key: "comunidade", label: "Comunidade", icon: "👥" },
  ];

  return (
    <main className="min-h-screen bg-[#050508] text-white">
                        <header className="relative z-50 border-b border-zinc-800/70 bg-zinc-900/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/icoauto-icon.png" alt="" className="h-9 w-9 rounded-xl shadow-lg shadow-orange-600/30" />
              <span className="text-lg font-bold tracking-tight text-white">
                Auto <span className="text-amber-400">Elétrica</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/perfil"
              className="hidden sm:flex rounded-lg border border-zinc-700 px-4 py-2 text-base text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="hidden sm:flex rounded-lg border border-red-700 px-4 py-2 text-base text-red-400 transition hover:border-red-600 hover:bg-red-500/10 hover:text-red-300"
            >
              Sair
            </button>
            <div className="relative sm:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg border border-amber-500/40 px-3 py-2 text-lg text-zinc-300 transition hover:bg-amber-500/10"
              >
                ⋮
              </button>
              {menuOpen && (
                <>
                  <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-zinc-700 bg-[#0a0a12] shadow-2xl">
                    <Link href="/perfil" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 rounded-t-xl">Perfil</Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl">Sair</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b border-zinc-800/70 bg-[#0a0a12]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-3 py-3 sm:px-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => t.href ? window.location.href = t.href : setTab(t.key)}
              className={`flex min-w-max items-center gap-2 rounded-xl px-4 py-3 text-base font-semibold transition ${
                tab === t.key && !t.href
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Olá, {session?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-base text-zinc-400">
          Gerencie os materiais e as dúvidas dos alunos.
        </p>

        {tab === "conteudo" && <ConteudoViewer />}
        {tab === "materiais" && <ModulesManager />}
        {tab === "duvidas" && <QuestionsManager />}
        {tab === "comunidade" && <ComunidadeTab session={session!} />}
      </div>
    </main>
  );
}