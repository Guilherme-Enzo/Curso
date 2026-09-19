"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CourseModule } from "./types";
import ConfirmModal from "./ConfirmModal";
import ErrorModal from "./ErrorModal";
import ModuleEditModal from "./ModuleEditModal";
import { withBasePath } from "@/lib/publicPath";

type Form = {
  name: string;
  description: string;
  file: File | null;
  video: File | null;
  videoTitle: string;
};

const emptyForm: Form = { name: "", description: "", file: null, video: null, videoTitle: "" };

export default function ModulesManager() {
  const [modules, setModules] = useState<CourseModule[] | null>(null);
  const modulesRef = useRef<CourseModule[] | null>(null);
  const [status, setStatus] = useState<{
    type: "ok" | "err";
    msg: string;
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CourseModule | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editModule, setEditModule] = useState<{ id: string; name: string; description: string | null; synopsis: string | null; pdfUrl: string | null; order: number; quiz: { source: string; questionCount: number } | null } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(withBasePath(`/api/modules?t=${Date.now()}`));
      if (!res.ok) return;
      const data = await res.json();
      setModules(data.modules);
    } catch {
      setStatus({ type: "err", msg: "Falha de conexão" });
    }
  }, []);

  useEffect(() => {
    modulesRef.current = modules;
  }, [modules]);

  useEffect(() => {
    load();
  }, [load]);

  function moveModule(idx: number, dir: -1 | 1) {
    if (!modules) return;
    const next = [...modules];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    modulesRef.current = next;
    setModules([...next]);
  }

  async function saveOrder() {
    setSavingOrder(true);
    setStatus(null);
    try {
      const current = modulesRef.current;
      if (!current || current.length === 0) {
        setStatus({ type: "err", msg: "Nenhum modulo para salvar" });
        setSavingOrder(false);
        return;
      }
      const order = current.map((m, i) => ({ id: m.id, order: i + 1 }));
      const res = await fetch(withBasePath("/api/modules/reorder"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "err", msg: data.error || "Erro ao salvar ordem" });
        setSavingOrder(false);
        return;
      }
      setModules(current.map((m, i) => ({ ...m, order: i + 1 })));
      modulesRef.current = current.map((m, i) => ({ ...m, order: i + 1 }));
      setReorderSuccess("Ordem salva com sucesso!");
      setReordering(false);
      setTimeout(() => setReorderSuccess(null), 2000);
    } catch (e) {
      setStatus({ type: "err", msg: "Falha ao salvar ordem" });
    } finally {
      setSavingOrder(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      void handlePatch(editingId, e);
    } else {
      void handleCreate(e);
    }
  }
  async function sendForm(url: string, isCreate: boolean) {
    setSending(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      if (form.file) fd.append("file", form.file);

      const res = await fetch(url, {
        method: isCreate ? "POST" : "PATCH",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao salvar módulo");
        return null;
      }
      const quizMsg =
        data.aiError != null
          ? ` (${data.aiError})`
          : data.quiz
          ? " — quiz gerado com IA"
          : "";
      const contentMsg = data.content
        ? ` — conteúdo gerado (${data.content.submodules?.length ?? 0} submódulos)`
        : "";
      let videoMsg = "";
      if (form.video && data.module?.id) {
        try {
          const vfd = new FormData();
          vfd.append("moduleId", data.module.id);
          vfd.append("title", form.videoTitle || form.video.name);
          vfd.append("file", form.video);
          const vRes = await fetch(withBasePath("/api/videos"), { method: "POST", body: vfd });
          if (vRes.ok) videoMsg = " - video adicionado";
          else videoMsg = " - erro ao enviar video";
        } catch { videoMsg = " - erro ao enviar video"; }
      }
      return { message: quizMsg + contentMsg + videoMsg };
    } catch {
      setModalError("Falha de conexão");
      return null;
    } finally {
      setSending(false);
    }
  }

  async function handleCreate(_e: React.FormEvent) {
    const ok = await sendForm(withBasePath("/api/modules"), true);
    if (!ok) return;
    setModalSuccess(`Módulo adicionado com sucesso!${ok.message}`);
    load();
    setTimeout(() => {
      setCreating(false);
      setModalSuccess(null);
      setForm(emptyForm);
    }, 2000);
  }

  async function handlePatch(id: string, _e: React.FormEvent) {
    const ok = await sendForm(withBasePath(`/api/modules/${id}`), false);
    if (!ok) return;
    setModalSuccess(`Módulo atualizado com sucesso!${ok.message}`);
    load();
    setTimeout(() => {
      setEditingId(null);
      setModalSuccess(null);
      setForm(emptyForm);
    }, 2000);
  }

  async function handleRegenerate(m: CourseModule) {
    if (!m.pdfUrl) return;
    setRegenerating(m.id);
    setStatus(null);
    try {
      const res = await fetch(withBasePath(`/api/modules/${m.id}/quiz`), { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao gerar quiz com IA");
        return;
      }
      setStatus({ type: "ok", msg: `Quiz do "${m.name}" regenerado com ${data.quiz?.questionCount ?? "10"} perguntas!` });
      load();
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setRegenerating(null);
    }
  }

  async function handleDelete(m: CourseModule) {
    setStatus(null);
    setDeleting(m.id);
    try {
      const res = await fetch(withBasePath(`/api/modules/${m.id}`), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setModalError(data.error || "Erro ao excluir módulo");
        return;
      }
      setDeleteSuccess(`Módulo "${m.name}" excluído com sucesso!`);
      load();
      setTimeout(() => setDeleteSuccess(null), 2000);
    } catch {
      setStatus({ type: "err", msg: "Falha de conexão" });
    } finally {
      setDeleting(null);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setCreating(true);
    setModalSuccess(null);
    setStatus(null);
  }

  function startEdit(m: CourseModule) {
    setCreating(false);
    setEditingId(null);
    setForm({ name: m.name, description: m.description ?? "", file: null, video: null, videoTitle: "" });
    setEditModule({
      id: m.id,
      name: m.name,
      description: m.description ?? null,
      synopsis: m.synopsis ?? null,
      pdfUrl: m.pdfUrl ?? null,
      order: m.order,
      quiz: m.quiz ?? null,
    });
  }

  return (
    <section className="mt-6 space-y-8">
      <div className="space-y-3">
        <button
          onClick={startCreate}
          className="w-full rounded-2xl border-2 border-dashed border-amber-600/40 bg-zinc-900 p-6 text-lg font-bold text-amber-400 transition hover:border-amber-500/70 hover:bg-amber-500/10"
        >
          ＋ Adicionar novo módulo
        </button>
        {modules && modules.length > 1 && (
          <button
            onClick={() => setReordering(true)}
            className="w-full rounded-2xl border-2 border-dashed border-zinc-600 bg-zinc-900 px-6 py-4 text-lg font-bold text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-300"
          >
            ↕ Reorganizar módulos
          </button>
        )}
      </div>

      {reordering && modules && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setReordering(false)}
        >
          <div
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Reorganizar módulos</h2>
              <button
                onClick={() => setReordering(false)}
                className="text-xl text-zinc-500 transition hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mb-3 text-sm text-zinc-400">
              Use as setas para reorganizar a ordem dos módulos.
            </p>
            <div className="space-y-2">
              {modules.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-sm font-black text-amber-400">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-base font-semibold text-white">
                    {m.name}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveModule(idx, -1)}
                      disabled={idx === 0}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-600 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveModule(idx, 1)}
                      disabled={idx === modules.length - 1}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-600 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveOrder}
                disabled={savingOrder}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-base font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {savingOrder ? "Salvando..." : "Salvar ordem"}
              </button>
              <button
                onClick={() => setReordering(false)}
                className="rounded-xl border border-zinc-700 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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

      {(creating || editingId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (modalSuccess) return;
            setCreating(false);
            setEditingId(null);
            setForm(emptyForm);
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {modalSuccess
                  ? "Sucesso"
                  : editingId
                  ? "Editar módulo"
                  : "Adicionar módulo"}
              </h2>
              {!modalSuccess && (
                <button
                  onClick={() => {
                    setCreating(false);
                    setEditingId(null);
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
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  Nome do módulo
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={sending}
                  placeholder="Ex.: Sensores"
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  Descrição (opcional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={6}
                  disabled={sending}
                  placeholder="Liste o conteúdo do módulo (ex.: um tópico por linha)"
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  {editingId
                    ? "Trocar PDF (opcional — deixa vazio pra manter)"
                    : "PDF (opcional)"}
                </label>
                <p className="mt-1 text-sm text-zinc-500">
                  Ao salvar ou trocar o PDF, o quiz do módulo (10 perguntas) é
                  gerado automaticamente com IA.
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={sending}
                  onChange={(e) =>
                    setForm({ ...form, file: e.target.files?.[0] ?? null })
                  }
                  className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-zinc-600 bg-zinc-950 px-4 py-4 text-base text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-amber-500 file:to-orange-600 file:px-4 file:py-2 file:text-base file:font-bold file:text-zinc-950 hover:border-amber-500/50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-zinc-200">
                  Video (opcional)
                </label>
                <p className="mt-1 text-sm text-zinc-500">
                  Video introdutorio ou complementar para o modulo.
                </p>
                <input
                  type="file"
                  accept="video/*"
                  disabled={sending}
                  onChange={(e) =>
                    setForm({ ...form, video: e.target.files?.[0] ?? null })
                  }
                  className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-zinc-600 bg-zinc-950 px-4 py-4 text-base text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-violet-500 file:to-cyan-500 file:px-4 file:py-2 file:text-base file:font-bold file:text-zinc-950 hover:border-violet-500/50 disabled:opacity-50"
                />
                {form.video && (
                  <p className="mt-2 text-sm text-violet-300">
                    {form.video.name} ({(form.video.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
                {form.video && (
                  <input
                    type="text"
                    value={form.videoTitle}
                    onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                    placeholder="Titulo do video"
                    disabled={sending}
                    className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-violet-500 disabled:opacity-50"
                  />
                )}
              </div>

              {sending && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                  <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-amber-400 border-t-transparent" />
                  <div>
                    <p className="text-base font-bold text-amber-300">
                      {form.file
                        ? "Enviando PDF, gerando conteúdo e quiz com IA..."
                        : "Salvando módulo..."}
                    </p>
                    <p className="mt-0.5 text-sm text-amber-200/70">
                      {form.file
                        ? "A IA está lendo o PDF para gerar o conteúdo e as perguntas. Pode levar até 1 minuto. Não feche esta página."
                        : "Aguarde enquanto o módulo é atualizado."}
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
                  {sending
                    ? "Salvando..."
                    : editingId
                    ? "Salvar alterações"
                    : "Publicar módulo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditingId(null);
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
          Módulos do curso{" "}
          <span className="ml-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-400">
            {modules?.length ?? "..."}
          </span>
        </h2>
        {!modules ? (
          <p className="mt-3 text-base text-zinc-500">Carregando...</p>
        ) : modules.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
            Nenhum módulo cadastrado ainda.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {modules.map((m) => (
              <article
                key={m.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-sm font-black text-amber-400">
                        {m.order}
                      </span>
                      <h3 className="text-xl font-bold text-white">{m.name}</h3>
                    </div>
                    {m.description ? (
                      <pre className="mt-2 whitespace-pre-line text-base leading-relaxed text-zinc-400">
                        {m.description}
                      </pre>
                    ) : m.synopsis ? (
                      <pre className="mt-2 whitespace-pre-line text-base leading-relaxed text-zinc-400">
                        {m.synopsis}
                      </pre>
                    ) : null}
                    <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      {m.quiz ? (
                        m.quiz.source === "ia" ? (
                          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            Quiz IA pronto · {m.quiz.questionCount} perguntas
                          </span>
                        ) : (
                          <span className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                            Quiz do livro
                          </span>
                        )
                      ) : (
                        <span className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Sem quiz
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-row flex-wrap gap-2">
                    {m.pdfUrl ? (
                      <button
                        onClick={() => handleRegenerate(m)}
                        disabled={regenerating === m.id}
                        className="rounded-lg border border-cyan-600/50 px-4 py-2 text-base font-semibold text-cyan-300 transition hover:bg-cyan-500/10 disabled:opacity-80"
                      >
                        {regenerating === m.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                            Gerando...
                          </span>
                        ) : (
                          "🤖 Gerar quiz com IA"
                        )}
                      </button>
                    ) : (
                      <span className="rounded-lg border border-zinc-700/50 px-4 py-2 text-sm text-zinc-500">
                        Sem PDF — faça upload para gerar quiz
                      </span>
                    )}
                    <button
                      onClick={() => startEdit(m)}
                      className="rounded-lg border border-amber-600/50 px-4 py-2 text-base font-semibold text-amber-400 transition hover:bg-amber-500/10"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDelete(m)}
                      disabled={deleting === m.id || regenerating === m.id}
                      className="rounded-lg border border-red-800/60 px-4 py-2 text-base font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-80"
                    >
                      {deleting === m.id ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          Excluindo...
                        </span>
                      ) : (
                        "Excluir"
                      )}
                    </button>
                  </div>
                  {regenerating === m.id ? (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-cyan-600/40 bg-cyan-500/10 p-4">
                      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                      <div>
                        <p className="text-sm font-bold text-cyan-300">
                          Gerando o quiz do “{m.name}” com IA...
                        </p>
                        <p className="mt-0.5 text-xs text-cyan-200/70">
                          Lendo o PDF e criando as 10 perguntas. Isso pode levar
                          até 1 minuto. Não feche esta página.
                        </p>
                      </div>
                    </div>
                  ) : deleting === m.id ? (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-500/10 p-4">
                      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      <div>
                        <p className="text-sm font-bold text-red-300">
                          Excluindo o módulo “{m.name}”...
                        </p>
                        <p className="mt-0.5 text-xs text-red-200/70">
                          Aguarde enquanto o módulo e o conteúdo dele são
                          removidos.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir módulo"
          message={`Excluir o módulo "${confirmDelete.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            handleDelete(confirmDelete);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {deleteSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
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
      {modalSuccess && !(creating || editingId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setModalSuccess(null)}
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <p className="text-base font-bold text-emerald-400">
                {modalSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {reorderSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setReorderSuccess(null)}
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <p className="text-base font-bold text-emerald-400">
                {reorderSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}

      {editModule && (
        <ModuleEditModal
          module={editModule}
          onClose={() => setEditModule(null)}
          onSaved={() => { setEditModule(null); load(); setModalSuccess("Módulo atualizado!"); setTimeout(() => setModalSuccess(null), 3000); }}
          onError={(msg) => { setEditModule(null); setModalError(msg); }}
        />
      )}
    </section>
  );
}
