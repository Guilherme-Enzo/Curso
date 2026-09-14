"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModulesManager from "@/app/components/ModulesManager";
import QuestionsManager from "@/app/components/QuestionsManager";
import ConteudoViewer from "@/app/components/ConteudoViewer";

type Session = { userId: string; role: string; name: string };

type Tab = "conteudo" | "materiais" | "duvidas";

export default function TeacherPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("materiais");

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

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "conteudo", label: "Conteúdo", icon: "📚" },
    { key: "materiais", label: "Materiais", icon: "📤" },
    { key: "duvidas", label: "Canal de Dúvidas", icon: "💬" },
  ];

  return (
    <main className="min-h-screen bg-[#050508] text-white">
      <header className="border-b border-zinc-800/70 bg-zinc-900/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-lg font-black text-zinc-950 shadow-lg shadow-orange-600/30">
              ⚡
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Auto <span className="text-amber-400">Elétrica</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/comunidade"
              className="rounded-lg border border-amber-600/50 px-4 py-2 text-base text-amber-400 transition hover:bg-amber-500/10 hover:text-amber-300"
            >
              Comunidade
            </Link>
            <Link
              href="/perfil"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-base text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-700 px-4 py-2 text-base text-red-400 transition hover:border-red-600 hover:bg-red-500/10 hover:text-red-300"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b border-zinc-800/70 bg-[#0a0a12]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-3 py-3 sm:px-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex min-w-max items-center gap-2 rounded-xl px-4 py-3 text-base font-semibold transition ${
                tab === t.key
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
      </div>
    </main>
  );
}