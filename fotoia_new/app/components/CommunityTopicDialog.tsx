"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { withBasePath } from "@/lib/publicPath";

type Topic = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorRole?: string;
  createdAt: string;
};

type Message = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  topic: Topic | null;
  userId: string;
  onClose: () => void;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} · ${d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function CommunityTopicDialog({ topic, userId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Message | null>(null);
  const [status, setStatus] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    if (!topic) return;
    setMessages(null);
    setStatus(null);
    setMenuOpenId(null);
    nearBottomRef.current = true;
    let active = true;
    let timer: ReturnType<typeof setInterval>;
    const tick = async () => {
      try {
        const res = await fetch(withBasePath(`/api/topics/${topic.id}`));
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        const next = data.topic.messages;
        setMessages((prev) => {
          if (!prev) {
            nearBottomRef.current = true;
            scrollToBottom();
            return next;
          }
          const changed =
            prev.length !== next.length ||
            prev[prev.length - 1]?.id !== next[next.length - 1]?.id;
          if (!changed) return prev;
          if (nearBottomRef.current) scrollToBottom();
          return next;
        });
      } catch {
        // silencioso para não espalhar erro durante o polling
      }
    };
    void tick();
    timer = setInterval(tick, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [topic, scrollToBottom]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuOpenId && !(e.target as HTMLElement).closest("[data-menu]")) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!topic || !text.trim() || sending) return;
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch(withBasePath(`/api/topics/${topic.id}/messages`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "err", msg: data.error || "Erro ao enviar comentário" });
        return;
      }
      setMessages((prev) => [...(prev ?? []), data.message]);
      setText("");
      setStatus(null);
      scrollToBottom();
    } catch {
      setStatus({ type: "err", msg: "Falha de conexão" });
    } finally {
      setSending(false);
    }
  }

  function startEdit(m: Message) {
    setEditingId(m.id);
    setEditText(m.content);
    setMenuOpenId(null);
    setStatus(null);
  }

  async function handleSaveEdit(m: Message) {
    if (!editText.trim() || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(withBasePath(`/api/topics/${topic!.id}/messages/${m.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "err", msg: data.error || "Erro ao editar comentário" });
        return;
      }
      setMessages((prev) =>
        (prev ?? []).map((x) =>
          x.id === m.id
            ? { ...x, content: data.message.content, updatedAt: data.message.updatedAt }
            : x
        )
      );
      setEditingId(null);
      setEditText("");
      setStatus({ type: "ok", msg: "Comentário editado com sucesso!" });
    } catch {
      setStatus({ type: "err", msg: "Falha de conexão" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(m: Message) {
    setMenuOpenId(null);
    setStatus(null);
    setDeletingId(m.id);
    try {
      const res = await fetch(withBasePath(`/api/topics/${topic!.id}/messages/${m.id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus({ type: "err", msg: data.error || "Erro ao excluir comentário" });
        return;
      }
      setMessages((prev) => (prev ?? []).filter((x) => x.id !== m.id));
      setStatus({ type: "ok", msg: "Comentário excluído com sucesso!" });
    } catch {
      setStatus({ type: "err", msg: "Falha de conexão" });
    } finally {
      setDeletingId(null);
    }
  }

  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-zinc-700 bg-zinc-900 sm:h-[min(720px,90vh)] sm:max-w-lg sm:rounded-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-zinc-800 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              {topic.authorName}
            </p>
            <h2 className="text-lg font-bold text-white">{topic.title}</h2>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
              {topic.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            ✕ Fechar
          </button>
        </header>

        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            nearBottomRef.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
        >
          {!messages ? (
            <p className="text-center text-sm text-zinc-500">Carregando...</p>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-base text-zinc-500">
              Nenhum comentário ainda. Comece a conversa!
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.authorId === userId;
              return (
                <div key={m.id} className="space-y-2">
                  <div
                    className={`max-w-[85%] min-w-0 rounded-2xl px-4 py-3 ${
                      mine
                        ? "ml-auto rounded-br-md border border-amber-600/40 bg-gradient-to-br from-amber-500/20 to-orange-600/10"
                        : "rounded-bl-md border border-zinc-800 bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-amber-400">
                        {mine ? "Você" : m.authorName}
                      </p>
                      <div className="relative flex items-center gap-1">
                        <p className="text-[11px] text-zinc-500">
                          {formatTime(m.updatedAt)}
                          {m.updatedAt !== m.createdAt ? " (editado)" : ""}
                        </p>
                        {mine && editingId !== m.id && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(menuOpenId === m.id ? null : m.id);
                              }}
                              disabled={deletingId === m.id}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-base font-bold text-zinc-200 transition hover:bg-zinc-600 hover:text-white disabled:opacity-50"
                            >
                              ⋮
                            </button>
                            {menuOpenId === m.id && (
                              <div
                                data-menu
                                className="absolute right-0 top-7 z-50 w-36 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl"
                              >
                                <button
                                  onClick={() => startEdit(m)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-zinc-700"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(m)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/15"
                                >
                                  Excluir
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-100">
                      {m.content}
                    </p>
                  </div>

                  {mine && deletingId === m.id && (
                    <div className="ml-auto flex max-w-[85%] items-center gap-3 rounded-xl border border-red-800/60 bg-red-500/10 p-3">
                      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      <p className="text-sm font-bold text-red-300">
                        Excluindo comentário, aguarde...
                      </p>
                    </div>
                  )}

                  {mine && editingId === m.id && (
                    <div className="ml-auto max-w-[85%] space-y-2 rounded-2xl rounded-br-md border border-amber-500/40 bg-zinc-950 p-4">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        disabled={saving}
                        autoFocus
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                      />
                      {saving && (
                        <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
                          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                          <p className="text-sm font-bold text-amber-300">
                            Salvando comentário, aguarde...
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(m)}
                          disabled={saving || !editText.trim()}
                          className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          {saving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                            setStatus(null);
                          }}
                          disabled={saving}
                          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {status && (
          <div className="mx-5">
            <p
              className={`rounded-2xl border p-3 text-sm ${
                status.type === "ok"
                  ? "border-emerald-800/60 bg-emerald-500/10 text-emerald-400"
                  : "border-red-800/60 bg-red-500/10 text-red-400"
              }`}
            >
              {status.msg}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 border-t border-zinc-800 p-4"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            disabled={sending}
            placeholder="Escreva um comentário..."
            className="min-h-0 flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </form>
        {sending && (
          <p className="border-t border-zinc-800 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
            Enviando comentário, aguarde...
          </p>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir comentário"
          message="Excluir este comentário? Essa ação não pode ser desfeita."
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            handleDelete(confirmDelete);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
