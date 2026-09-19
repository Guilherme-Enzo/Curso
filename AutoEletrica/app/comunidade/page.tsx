"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CommunityTopicDialog from "@/app/components/CommunityTopicDialog";
import ConfirmModal from "@/app/components/ConfirmModal";
import ErrorModal from "@/app/components/ErrorModal";

type Session = { id: string; role: string; name: string };

type Topic = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
  messageCount: number;
  unreadCount: number;
};

type Form = { title: string; description: string };

const emptyForm: Form = { title: "", description: "" };

export default function ComunidadePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openTopic, setOpenTopic] = useState<Topic | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<Topic | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);

  const staff = session?.role === "teacher" || session?.role === "admin";

  const loadTopics = useCallback(async () => {
    try {
      const res = await fetch("/api/topics");
      if (!res.ok) return;
      const data = await res.json();
      setTopics(data.topics);
    } catch {
      setModalError("Falha de conexão");
    }
  }, []);

  
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
        setSession(data.user);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (session) loadTopics();
  }, [session, loadTopics]);

  const home = session?.role === "admin" ? "/admin" : session?.role === "teacher" ? "/professor" : "/aluno";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao criar tópico");
        return;
      }
      setModalSuccess("Tópico criado com sucesso!");
      loadTopics();
      setTimeout(() => {
        setCreating(false);
        setModalSuccess(null);
        setForm(emptyForm);
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  function handleOpenTopic(t: Topic) {
    setOpenTopic(t);
  }

  function handleCloseTopic() {
    setOpenTopic(null);
    loadTopics();
  }

  async function handleDeleteTopic(t: Topic, e: React.MouseEvent) {
    e.stopPropagation();
    setStatus(null);
    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/topics/${t.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setModalError(data.error || "Erro ao excluir tópico");
        return;
      }
      setDeleteSuccess(`Tópico "${t.title}" excluído com sucesso!`);
      loadTopics();
      setTimeout(() => setDeleteSuccess(null), 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050508] text-sm text-zinc-400">
        Carregando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050508] text-white">
            <header className="relative z-50 border-b border-violet-400/30 bg-violet-500/[0.06] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/icoauto-icon.png" alt="" className="h-9 w-9 rounded-xl shadow-lg shadow-orange-600/30" />
              <span className="text-lg font-bold tracking-tight text-white">
                Retrato <span className="text-violet-400">ImAginado</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/comunidade"
              className="hidden sm:flex rounded-lg border border-violet-400/50 px-4 py-2 text-base text-violet-300 transition hover:bg-violet-500/[0.12] hover:text-violet-200"
            >
              Comunidade
            </Link>
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
                    <Link href="/comunidade" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-violet-300 hover:bg-violet-500/10 rounded-t-xl">Comunidade</Link>
                    <Link href="/perfil" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-zinc-300 hover:bg-violet-500/10">Perfil</Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl">Sair</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">
          💬 Comunidade
        </h1>
        <p className="mt-2 text-base text-zinc-400">
          Fórum de conversas com memória permanente do curso. Crie um tópico para
          discutir dúvidas, conteúdos e novidades.
        </p>

        <section className="mt-8 space-y-8">
          <button
            onClick={() => {
              setCreating(true);
              setStatus(null);
            }}
            className="w-full rounded-2xl border-2 border-dashed border-amber-600/40 bg-zinc-900 p-6 text-lg font-bold text-amber-400 transition hover:border-amber-500/70 hover:bg-amber-500/10"
          >
            ＋ Criar novo tópico
          </button>

          {status && (
            <p
              className={`rounded-2xl border p-4 text-base ${
                status.type === "ok"
                  ? "border-emerald-800/60 bg-emerald-500/10 text-emerald-400"
                  : "border-red-800/60 bg-red-500/10 text-red-400"
              }`}
            >
              {status.msg}
            </p>
          )}

          {creating && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={() => {
                if (modalSuccess || sending) return;
                setCreating(false);
                setForm(emptyForm);
              }}
            >
              <div
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {modalSuccess ? "Sucesso" : "Criar tópico"}
                  </h2>
                  {!modalSuccess && !sending && (
                    <button
                      onClick={() => {
                        setCreating(false);
                        setForm(emptyForm);
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
                <form onSubmit={handleCreate} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-base font-semibold text-zinc-200">
                      Título do tópico
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      disabled={sending}
                      placeholder="Ex.: Dúvida sobre o módulo de sensores"
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-zinc-200">
                      Descrição do tópico
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      required
                      rows={5}
                      disabled={sending}
                      placeholder="Explique o assunto que você quer discutir..."
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>

                  {sending && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                      <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-amber-400 border-t-transparent" />
                      <div>
                        <p className="text-base font-bold text-amber-300">
                          Criando tópico, aguarde...
                        </p>
                        <p className="mt-0.5 text-sm text-amber-200/70">
                          Aguarde enquanto o tópico é salvo na comunidade.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={sending}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {sending ? "Salvando..." : "Publicar tópico"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setForm(emptyForm);
                      }}
                      className="rounded-xl border border-zinc-700 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
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
              Tópicos da comunidade{" "}
              <span className="ml-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-400">
                {topics?.length ?? "..."}
              </span>
            </h2>
            {!topics ? (
              <p className="mt-3 text-base text-zinc-500">Carregando...</p>
            ) : topics.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
                Nenhum tópico criado ainda. Seja a primeira pessoa a começar a
                conversa!
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {topics.map((t) => (
                  <article
                    key={t.id}
                    onClick={() => handleOpenTopic(t)}
                    className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-amber-600/40 hover:bg-zinc-900/70"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold text-white">
                          {t.title}
                        </h3>
                        <pre className="mt-2 whitespace-pre-line text-base leading-relaxed text-zinc-400">
                          {t.description}
                        </pre>
                        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                          <span className="font-semibold text-zinc-300">
                            {t.authorName}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(t.createdAt).toLocaleDateString("pt-BR")},{" "}
                            {new Date(t.createdAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-semibold text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300">
                          💬 Abrir conversa
                          {t.unreadCount > 0 && (
                            <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-zinc-950">
                              {t.unreadCount}
                            </span>
                          )}
                        </span>
                      </div>
                      {staff && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(t);
                          }}
                          disabled={deletingId === t.id}
                          className="rounded-lg border border-red-800/60 px-4 py-2 text-base font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-80"
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
                      )}
                    </div>
                    {deletingId === t.id ? (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-500/10 p-4">
                        <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        <div>
                          <p className="text-sm font-bold text-red-300">
                            Excluindo o tópico “{t.title}”...
                          </p>
                          <p className="mt-0.5 text-xs text-red-200/70">
                            Aguarde enquanto o tópico é removido da comunidade.
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {openTopic && session && (
        <CommunityTopicDialog
          topic={openTopic}
          userId={session.id}
          onClose={handleCloseTopic}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Excluir tópico"
          message={`Excluir o tópico "${confirmDelete.title}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            handleDeleteTopic(confirmDelete, { stopPropagation: () => {} } as React.MouseEvent);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {deleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
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

      <footer className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/icoauto-icon.png" alt="" className="h-7 w-7 rounded-lg" />
              <span className="text-xs font-bold text-white">
                Auto <span className="text-amber-400">Elétrica</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <Link href={home} className="transition hover:text-white">Voltar</Link>
              <Link href="/" className="transition hover:text-white">Início</Link>
            </div>
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Auto Elétrica</p>
          </div>
        </div>
      </footer>
    </main>
  );
}