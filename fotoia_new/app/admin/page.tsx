"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModulesManager from "@/app/components/ModulesManager";
import QuestionsManager from "@/app/components/QuestionsManager";
import ConteudoViewer from "@/app/components/ConteudoViewer";
import ConfirmModal from "@/app/components/ConfirmModal";
import ErrorModal from "@/app/components/ErrorModal";
import ComunidadeTab from "@/app/components/ComunidadeTab";
import { withBasePath } from "@/lib/publicPath";

type Session = { userId: string; role: string; name: string };

type Stats = {
  students: number;
  teachers: number;
  modules: number;
  openQuestions: number;
  answeredQuestions: number;
  quizzes: number;
};

type Teacher = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type Tab = "dashboard" | "conteudo" | "materiais" | "duvidas" | "professores" | "alunos" | "comunidade";

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  
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
        const res = await fetch(withBasePath("/api/auth/session"));
        if (!res.ok) {
          window.location.href = withBasePath("/login");
          return;
        }
        const data = await res.json();
        if (data?.user?.role !== "admin") {
          window.location.href = data?.user?.role === "teacher" ? withBasePath("/professor") : withBasePath("/aluno");
          return;
        }
        setSession(data.user);
      } catch {
        window.location.href = withBasePath("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

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

  const tabs: { key: Tab; label: string; icon: string; href?: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "conteudo", label: "Conteúdo", icon: "📚" },
    { key: "materiais", label: "Materiais", icon: "📤" },
    { key: "duvidas", label: "Canal de Dúvidas", icon: "💬" },
    { key: "comunidade", label: "Comunidade", icon: "👥" },
    { key: "professores", label: "Professores", icon: "👨‍🏫" },
    { key: "alunos", label: "Alunos", icon: "🎓" },
  ];

  return (
    <main className="min-h-screen bg-[#050508] text-white">
                  <header className="relative z-50 border-b border-violet-400/30 bg-violet-500/[0.06] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/icofotoia-icon.png" alt="" className="h-9 w-9 rounded-xl shadow-lg shadow-violet-500/30" />
              <span className="text-lg font-bold tracking-tight text-white">
                Retrato <span className="text-violet-400">ImAginado</span>
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
            <div className="relative sm:hidden">
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
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-3 py-3 sm:px-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => t.href ? window.location.href = t.href : setTab(t.key)}
              className={`flex min-w-max items-center gap-2 rounded-xl px-4 py-3 text-base font-semibold transition ${
                tab === t.key && !t.href
                  ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-zinc-950"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Painel do Admin
        </h1>
        <p className="mt-1 text-base text-zinc-400">
          Olá, {session?.name}. Gerencie o conteúdo e as equipes da plataforma.
        </p>

        {tab === "dashboard" && <Dashboard />}
        {tab === "conteudo" && <ConteudoViewer />}
        {tab === "materiais" && <ModulesManager />}
        {tab === "duvidas" && <QuestionsManager />}
        {tab === "comunidade" && <ComunidadeTab session={session!} />}
        {tab === "professores" && <TeachersManager />}
        {tab === "alunos" && <StudentsManager />}
      </div>

      <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
        <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/icofotoia-icon.png" alt="" className="h-7 w-7 rounded-lg" />
              <span className="text-xs font-bold text-white">
                Retrato <span className="text-violet-400">ImAginado</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <Link href="/" className="transition hover:text-white">Voltar ao início</Link>
            </div>
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Retrato ImAginado. Prompts de Fotografia e Edição com IA</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(withBasePath("/api/admin/stats"));
        if (!res.ok) {
          setError("Erro ao carregar estatísticas");
          return;
        }
        const data = await res.json();
        setStats(data.stats);
      } catch {
        setError("Falha de conexão");
      }
    }
    load();
  }, []);

  if (error) {
    return <p className="mt-6 text-base text-red-400">{error}</p>;
  }
  if (!stats) {
    return <p className="mt-6 text-base text-zinc-500">Carregando estatísticas...</p>;
  }

  const cards = [
    { label: "Alunos", value: stats.students, icon: "🎓" },
    { label: "Professores", value: stats.teachers, icon: "👨‍🏫" },
    { label: "Módulos", value: stats.modules, icon: "📚" },
    { label: "Dúvidas abertas", value: stats.openQuestions, icon: "💬" },
    { label: "Dúvidas respondidas", value: stats.answeredQuestions, icon: "✅" },
    { label: "Avaliações", value: stats.quizzes, icon: "📝" },
  ];

  return (
    <section className="mt-6">
      <h2 className="text-xl font-bold text-white">Visão geral</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{c.label}</p>
              <span className="text-xl">{c.icon}</span>
            </div>
            <p className="mt-2 text-4xl font-black text-white">{c.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeachersManager() {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Teacher | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(withBasePath("/api/admin/teachers"));
      if (!res.ok) {
        setModalError("Erro ao carregar professores");
        return;
      }
      const data = await res.json();
      setTeachers(data.teachers);
    } catch {
      setModalError("Falha de conexão");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const res = await fetch(withBasePath("/api/admin/teachers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao cadastrar professor");
        return;
      }
      setModalSuccess(`Professor ${data.teacher.name} cadastrado com sucesso!`);
      load();
      setTimeout(() => {
        setCreating(false);
        setModalSuccess(null);
        setName("");
        setEmail("");
        setPassword("");
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  async function handleRemove(id: string, teacherName: string) {
    setError("");
    setSuccess("");
    setDeletingId(id);
    try {
      const res = await fetch(withBasePath(`/api/admin/teachers/${id}`), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setModalError(data.error || "Erro ao excluir professor");
        return;
      }
      setDeleteSuccess(`Professor ${teacherName} excluído com sucesso!`);
      load();
      setTimeout(() => setDeleteSuccess(null), 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-6 space-y-8">
      <button
        onClick={() => {
          setCreating(true);
          setError("");
          setSuccess("");
          setModalSuccess(null);
        }}
        className="w-full rounded-2xl border-2 border-dashed border-amber-600/40 bg-zinc-900 p-6 text-lg font-bold text-violet-300 transition hover:border-amber-500/70 hover:bg-amber-500/10"
      >
        ＋ Cadastrar professor
      </button>

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (modalSuccess || sending) return;
            setCreating(false);
            setName("");
            setEmail("");
            setPassword("");
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {modalSuccess ? "Sucesso" : "Cadastrar professor"}
              </h2>
              {!modalSuccess && !sending && (
                <button
                  onClick={() => {
                    setCreating(false);
                    setName("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="text-xl text-zinc-500 transition hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {modalSuccess ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-500/10 p-5">
                <span className="text-2xl">✓</span>
                <p className="text-base font-bold text-emerald-400">
                  {modalSuccess}
                </p>
              </div>
            ) : (
            <form onSubmit={handleAdd} className="mt-5 space-y-4">
              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  Nome
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={sending}
                  placeholder="Ex.: Prof. Carlos"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={sending}
                  placeholder="prof@auto.com"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={sending}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              {error && <p className="text-base text-red-400">{error}</p>}

              {sending && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                  <div>
                    <p className="text-sm font-bold text-amber-300">
                      Cadastrando professor, aguarde...
                    </p>
                    <p className="mt-0.5 text-xs text-amber-200/70">
                      O acesso do professor está sendo criado e aparecerá na lista abaixo.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {sending ? "Cadastrando..." : "Cadastrar professor"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setName("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="rounded-xl border border-violet-400/25 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white">
          Professores cadastrados{" "}
          <span className="ml-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-violet-300">
            {teachers?.length ?? "..."}
          </span>
        </h2>
        {!teachers ? (
          <p className="mt-3 text-base text-zinc-500">Carregando...</p>
        ) : teachers.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
            Nenhum professor cadastrado ainda.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {teachers.map((t) => (
              <article
                key={t.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{t.email}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Cadastrado em {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(t)}
                  disabled={deletingId === t.id}
                  className="shrink-0 rounded-lg border border-red-800/60 px-4 py-2 text-base font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-80"
                >
                  {deletingId === t.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      Excluindo...
                    </span>
                  ) : (
                    "Excluir"
                  )}
                </button>
              </article>
            ))}
            {deletingId && (
              <div className="flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-500/10 p-4">
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                <p className="text-sm font-bold text-red-300">
                  Excluindo professor, aguarde...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir professor"
          message={`Excluir o professor ${confirmDelete.name}? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            handleRemove(confirmDelete.id, confirmDelete.name);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {deleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <p className="text-base font-bold text-emerald-400">
                {deleteSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}
    </section>
  );
}

function StudentsManager() {
  const [students, setStudents] = useState<Teacher[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Teacher | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(withBasePath("/api/admin/students"));
      if (!res.ok) {
        setModalError("Erro ao carregar alunos");
        return;
      }
      const data = await res.json();
      setStudents(data.students);
    } catch {
      setModalError("Falha de conexão");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const res = await fetch(withBasePath("/api/admin/students"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao cadastrar aluno");
        return;
      }
      setModalSuccess(`Aluno ${data.student.name} cadastrado com sucesso!`);
      load();
      setTimeout(() => {
        setCreating(false);
        setModalSuccess(null);
        setName("");
        setEmail("");
        setPassword("");
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  async function handleRemove(id: string, studentName: string) {
    setError("");
    setSuccess("");
    setDeletingId(id);
    try {
      const res = await fetch(withBasePath(`/api/admin/students/${id}`), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setModalError(data.error || "Erro ao excluir aluno");
        return;
      }
      setDeleteSuccess(`Aluno ${studentName} excluído com sucesso!`);
      load();
      setTimeout(() => setDeleteSuccess(null), 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-6 space-y-8">
      <button
        onClick={() => {
          setCreating(true);
          setError("");
          setSuccess("");
          setModalSuccess(null);
        }}
        className="w-full rounded-2xl border-2 border-dashed border-amber-600/40 bg-zinc-900 p-6 text-lg font-bold text-violet-300 transition hover:border-amber-500/70 hover:bg-amber-500/10"
      >
        ＋ Cadastrar aluno
      </button>

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (modalSuccess || sending) return;
            setCreating(false);
            setName("");
            setEmail("");
            setPassword("");
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {modalSuccess ? "Sucesso" : "Cadastrar aluno"}
              </h2>
              {!modalSuccess && !sending && (
                <button
                  onClick={() => {
                    setCreating(false);
                    setName("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="text-xl text-zinc-500 transition hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {modalSuccess ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-500/10 p-5">
                <span className="text-2xl">✓</span>
                <p className="text-base font-bold text-emerald-400">
                  {modalSuccess}
                </p>
              </div>
            ) : (
            <form onSubmit={handleAdd} className="mt-5 space-y-4">
              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  Nome
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={sending}
                  placeholder="Ex.: João Silva"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={sending}
                  placeholder="aluno@email.com"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={sending}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              {error && <p className="text-base text-red-400">{error}</p>}

              {sending && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                  <div>
                    <p className="text-sm font-bold text-amber-300">
                      Cadastrando aluno, aguarde...
                    </p>
                    <p className="mt-0.5 text-xs text-amber-200/70">
                      O acesso do aluno está sendo criado e aparecerá na lista abaixo.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {sending ? "Cadastrando..." : "Cadastrar aluno"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setName("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="rounded-xl border border-violet-400/25 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white">
          Alunos cadastrados{" "}
          <span className="ml-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-violet-300">
            {students?.length ?? "..."}
          </span>
        </h2>
        {!students ? (
          <p className="mt-3 text-base text-zinc-500">Carregando...</p>
        ) : students.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
            Nenhum aluno cadastrado ainda.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {students.map((s) => (
              <article
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{s.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{s.email}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Cadastrado em {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(s)}
                  disabled={deletingId === s.id}
                  className="shrink-0 rounded-lg border border-red-800/60 px-4 py-2 text-base font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-80"
                >
                  {deletingId === s.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      Excluindo...
                    </span>
                  ) : (
                    "Excluir"
                  )}
                </button>
              </article>
            ))}
            {deletingId && (
              <div className="flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-500/10 p-4">
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                <p className="text-sm font-bold text-red-300">
                  Excluindo aluno, aguarde...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir aluno"
          message={`Excluir o aluno ${confirmDelete.name}? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            handleRemove(confirmDelete.id, confirmDelete.name);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {deleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <p className="text-base font-bold text-emerald-400">
                {deleteSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}
    </section>
  );
}
