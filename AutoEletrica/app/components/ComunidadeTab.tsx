"use client";

import { useCallback, useEffect, useState } from "react";
import CommunityTopicDialog from "./CommunityTopicDialog";
import ConfirmModal from "./ConfirmModal";
import ErrorModal from "./ErrorModal";

type Topic = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  createdAt: string;
  messageCount: number;
  unreadCount: number;
};

type Session = { userId: string; role: string; name: string };

type Form = { title: string; description: string };
const emptyForm: Form = { title: "", description: "" };

export default function ComunidadeTab({ session }: { session: Session }) {
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
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const staff = session.role === "teacher" || session.role === "admin";

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
    loadTopics();
  }, [loadTopics]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setModalError(data.error || "Erro ao criar tópico"); return; }
      setModalSuccess("Tópico criado com sucesso!");
      loadTopics();
      setTimeout(() => { setCreating(false); setModalSuccess(null); setForm(emptyForm); }, 2000);
    } catch { setModalError("Falha de conexão"); } finally { setSending(false); }
  }

  async function handleDeleteTopic(t: Topic) {
    setStatus(null);
    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/topics/${t.id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setModalError(data.error || "Erro ao excluir"); return; }
      setDeleteSuccess(`Tópico "${t.title}" excluído!`);
      loadTopics();
      setTimeout(() => setDeleteSuccess(null), 2000);
    } catch { setModalError("Falha de conexão"); } finally { setDeletingId(null); }
  }

  return (
    <section className="mt-6 space-y-8">
      <button
        onClick={() => { setCreating(true); setStatus(null); }}
        className="w-full rounded-2xl border-2 border-dashed border-cyan-600/40 bg-zinc-900 p-6 text-lg font-bold text-cyan-300 transition hover:border-cyan-500/70 hover:bg-cyan-500/10"
      >
        ＋ Criar novo tópico
      </button>

      {status && (
        <p className={`rounded-2xl border p-4 text-base ${status.type === "ok" ? "border-emerald-800/60 bg-emerald-500/10 text-emerald-400" : "border-red-800/60 bg-red-500/10 text-red-400"}`}>
          {status.msg}
        </p>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => { if (modalSuccess || sending) return; setCreating(false); setForm(emptyForm); }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-400/25 bg-zinc-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{modalSuccess ? "Sucesso" : "Criar tópico"}</h2>
              {!modalSuccess && !sending && <button onClick={() => { setCreating(false); setForm(emptyForm); }} className="text-xl text-zinc-500 transition hover:text-white">✕</button>}
            </div>
            {modalSuccess ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-500/10 p-5">
                <span className="text-2xl">✓</span>
                <p className="text-base font-bold text-emerald-400">{modalSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="mt-5 space-y-4">
                <div>
                  <label className="block text-base font-semibold text-zinc-200">Título do tópico</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required disabled={sending} placeholder="Ex.: Dúvida sobre o módulo X" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-zinc-200">Descrição do tópico</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={5} disabled={sending} placeholder="Explique o assunto..." className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50" />
                </div>
                {sending && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                    <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-amber-400 border-t-transparent" />
                    <p className="text-base font-bold text-amber-300">Criando tópico...</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" disabled={sending} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50">{sending ? "Salvando..." : "Publicar tópico"}</button>
                  <button type="button" onClick={() => { setCreating(false); setForm(emptyForm); }} className="rounded-xl border border-cyan-400/25 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white">
          Tópicos da comunidade{" "}
          <span className="ml-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-400">{topics?.length ?? "..."}</span>
        </h2>
        {!topics ? (
          <p className="mt-3 text-base text-zinc-500">Carregando...</p>
        ) : topics.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">Nenhum tópico criado ainda.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {topics.map((t) => (
              <article key={t.id} onClick={() => setOpenTopic(t)} className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-amber-500/40 hover:bg-zinc-800/60">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white">{t.title}</h3>
                    <pre className="mt-2 whitespace-pre-line text-base leading-relaxed text-zinc-400">{t.description}</pre>
                    <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                      <span className="font-semibold text-zinc-300">{t.authorName}</span>
                      <span>·</span>
                      <span>{new Date(t.createdAt).toLocaleDateString("pt-BR")}, {new Date(t.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-semibold text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-300">
                      💬 Abrir conversa
                      {t.unreadCount > 0 && <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-zinc-950">{t.unreadCount}</span>}
                    </span>
                  </div>
                  {staff && (
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(t); }} disabled={deletingId === t.id} className="rounded-lg border border-red-800/60 px-4 py-2 text-base font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-80">
                      {deletingId === t.id ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />Excluindo...</span> : "Excluir"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {openTopic && <CommunityTopicDialog topic={openTopic} userId={session.userId} onClose={() => { setOpenTopic(null); loadTopics(); }} />}
      {confirmDelete && <ConfirmModal title="Excluir tópico" message={`Excluir "${confirmDelete.title}"?`} confirmLabel="Excluir" danger onConfirm={() => { handleDeleteTopic(confirmDelete); setConfirmDelete(null); }} onCancel={() => setConfirmDelete(null)} />}
      {deleteSuccess && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"><div className="flex items-center gap-3"><span className="text-2xl">✓</span><p className="text-base font-bold text-emerald-400">{deleteSuccess}</p></div></div></div>}
      {modalError && <ErrorModal message={modalError} onClose={() => setModalError(null)} />}
    </section>
  );
}
