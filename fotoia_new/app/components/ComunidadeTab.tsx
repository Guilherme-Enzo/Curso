"use client";

import { useCallback, useEffect, useState } from "react";
import CommunityTopicDialog from "./CommunityTopicDialog";
import ConfirmModal from "./ConfirmModal";
import ErrorModal from "./ErrorModal";
import { withBasePath } from "@/lib/publicPath";
import Icon from "@/app/components/Icon";

type Topic = {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  messageCount: number;
  unreadCount: number;
  isNew: boolean;
};

type Session = { userId: string; role: string; name: string };
type Props = { session: Session; onUnreadCountChange?: (count: number) => void };

type Form = { title: string; description: string };
const emptyForm: Form = { title: "", description: "" };

export default function ComunidadeTab({ session, onUnreadCountChange }: Props) {
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openTopic, setOpenTopic] = useState<Topic | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<Topic | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const loadTopics = useCallback(async () => {
    try {
      const res = await fetch(withBasePath("/api/topics"));
      if (!res.ok) return;
      const data = await res.json();
      setTopics(data.topics);
      onUnreadCountChange?.((Number(data.newTopicCount) || 0) + data.topics.reduce((total: number, topic: Topic) => total + topic.unreadCount, 0));
    } catch {
      setModalError("Falha de conexão");
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch(withBasePath("/api/topics"), {
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
      const res = await fetch(withBasePath(`/api/topics/${t.id}`), { method: "DELETE" });
      if (!res.ok) { const data = await res.json().catch(() => ({})); setModalError(data.error || "Erro ao excluir"); return; }
      setDeleteSuccess(`Tópico "${t.title}" excluído!`);
      loadTopics();
      setTimeout(() => setDeleteSuccess(null), 2000);
    } catch { setModalError("Falha de conexão"); } finally { setDeletingId(null); }
  }

  async function handleEditTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTopic) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch(withBasePath(`/api/topics/${editingTopic.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setModalError(data.error || "Erro ao editar tópico"); return; }
      setModalSuccess("Tópico editado com sucesso!");
      loadTopics();
      setTimeout(() => { setEditingTopic(null); setModalSuccess(null); setForm(emptyForm); }, 2000);
    } catch { setModalError("Falha de conexão"); } finally { setSending(false); }
  }

  function closeTopicForm() {
    if (modalSuccess || sending) return;
    setCreating(false);
    setEditingTopic(null);
    setForm(emptyForm);
  }

  function handleOpenTopic(t: Topic) {
    if (t.isNew) {
      setTopics((current) => current?.map((topic) => topic.id === t.id ? { ...topic, isNew: false } : topic) ?? null);
      onUnreadCountChange?.(Math.max(0, (topics ?? []).filter((topic) => topic.isNew).length - 1) + (topics ?? []).reduce((total, topic) => total + topic.unreadCount, 0));
    }
    setOpenTopic(t);
  }

  return (
    <section className="mt-6 space-y-6">
      <button
        onClick={() => { setCreating(true); setStatus(null); }}
        className="inline-flex rounded-lg border border-violet-400/30 bg-white/[0.025] px-4 py-3 text-sm font-medium text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/[0.08]"
      >
        ＋ Criar novo tópico
      </button>

      {status && (
        <p className={`max-w-3xl rounded-xl border p-4 text-base ${status.type === "ok" ? "border-emerald-800/60 bg-emerald-500/10 text-emerald-400" : "border-red-800/60 bg-red-500/10 text-red-400"}`}>
          {status.msg}
        </p>
      )}

      {(creating || editingTopic) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={closeTopicForm}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{modalSuccess ? "Sucesso" : editingTopic ? "Editar tópico" : "Criar tópico"}</h2>
              {!modalSuccess && !sending && <button onClick={closeTopicForm} className="text-xl text-zinc-500 transition hover:text-white">✕</button>}
            </div>
            {modalSuccess ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-500/10 p-5">
                <span className="text-2xl">✓</span>
                <p className="text-base font-bold text-emerald-400">{modalSuccess}</p>
              </div>
            ) : (
              <form onSubmit={editingTopic ? handleEditTopic : handleCreate} className="mt-5 space-y-4">
                <div>
                   <label className="block text-base font-semibold text-zinc-200">Título do tópico *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required disabled={sending} placeholder="Ex.: Dúvida sobre o módulo X" className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50" />
                </div>
                <div>
                   <label className="block text-base font-semibold text-zinc-200">Descrição do tópico *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={5} disabled={sending} placeholder="Explique o assunto..." className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50" />
                </div>
                {sending && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                    <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-amber-400 border-t-transparent" />
                     <p className="text-base font-bold text-amber-300">{editingTopic ? "Salvando alterações..." : "Criando tópico..."}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="submit" disabled={sending} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50">{sending ? "Salvando..." : editingTopic ? "Salvar alterações" : "Publicar tópico"}</button>
                  <button type="button" onClick={closeTopicForm} className="rounded-xl border border-violet-400/25 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

       <div>
        <h2 className="text-base font-medium text-white">
          Tópicos da comunidade{" "}
          <span className="ml-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-400">{topics?.length ?? "..."}</span>
        </h2>
        {!topics ? (
          <p className="mt-3 text-base text-zinc-500">Carregando...</p>
        ) : topics.length === 0 ? (
                   <p className="mt-3 rounded-xl border border-zinc-800/80 bg-white/[0.02] p-5 text-base text-zinc-400">Nenhum tópico criado ainda.</p>
        ) : (
             <div className="mt-3 grid gap-3 md:grid-cols-2">
              {topics.map((t) => (
               <article key={t.id} className="rounded-xl border border-zinc-800/80 bg-white/[0.02] p-5 transition hover:border-violet-500/40 hover:bg-violet-500/[0.04]">
                 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                   <div className="min-w-0">
                     {t.isNew && <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Novo</p>}
                     <h3 className="text-xl font-semibold text-white">{t.title}</h3>
                     <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-zinc-400">{t.description}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                      <span className="font-semibold text-zinc-300">{t.authorName}</span>
                      <span>·</span>
                        <span>Publicado em {new Date(t.createdAt).toLocaleDateString("pt-BR")} às {new Date(t.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </p>
                   </div>
                 </div>
                 <div className="mt-4 flex flex-wrap items-center gap-2">
                     <button onClick={(e) => { e.stopPropagation(); handleOpenTopic(t); }} className="inline-flex items-center gap-2 rounded-lg border border-violet-400/30 px-3 py-2 text-sm font-medium text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/10">
                      <Icon name="message" size={15} />
                      Abrir conversa
                      {t.unreadCount > 0 && <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-semibold text-violet-200">{t.unreadCount}</span>}
                    </button>
                    {(session.role === "admin" || t.authorId === session.userId) && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setEditingTopic(t); setForm({ title: t.title, description: t.description }); setModalSuccess(null); }} className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200">Editar</button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(t); }} disabled={deletingId === t.id} className="text-xs font-semibold text-red-400 transition hover:text-red-300 disabled:opacity-80">
                          {deletingId === t.id ? "Excluindo..." : "Excluir"}
                        </button>
                     </>
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
