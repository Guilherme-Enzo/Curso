"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import ErrorModal from "./ErrorModal";
import { withBasePath } from "@/lib/publicPath";
import SelectField from "./SelectField";
import FilePickerField from "./FilePickerField";

type PromptType = "EDITING" | "CREATION";
type Prompt = {
  id: string;
  categoryId: string;
  name: string;
  imageUrl: string;
  pdfUrl: string;
  description: string;
  promptText: string;
  isFree: boolean;
  order: number;
};
type Category = { id: string; name: string; type: PromptType; prompts: Prompt[]; _count?: { prompts: number } };
type PromptForm = { name: string; type: PromptType | ""; categoryId: string; description: string; promptText: string; isFree: boolean };
type ModalTransition = "idle" | "next" | "previous";
type PdfStatus = "idle" | "reading" | "ready" | "error";

const emptyForm: PromptForm = { name: "", type: "", categoryId: "", description: "", promptText: "", isFree: false };

async function responseJson(response: Response): Promise<Record<string, any>> {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`O servidor respondeu com um formato inesperado (${response.status}).`);
  }
}

export default function PromptsManager() {
  const [type, setType] = useState<PromptType>("EDITING");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PromptForm>(emptyForm);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [promptModal, setPromptModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState<PromptType | null>(null);
  const [categoryType, setCategoryType] = useState<PromptType | "">("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [returnToPrompt, setReturnToPrompt] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfStatus, setPdfStatus] = useState<PdfStatus>("idle");
  const [analysisToken, setAnalysisToken] = useState<string | null>(null);
  const [analysisImageUrl, setAnalysisImageUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ kind: "prompt" | "category"; id: string; name: string } | null>(null);
  const [modalTransition, setModalTransition] = useState<ModalTransition>("idle");
  const [transitionTarget, setTransitionTarget] = useState<Prompt | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const [touchDirection, setTouchDirection] = useState<-1 | 1 | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchAxis = useRef<"horizontal" | "vertical" | null>(null);
  const touchOffsetRef = useRef(0);

  async function load() {
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(withBasePath("/api/prompts/public"), { signal: controller.signal });
      const data = await responseJson(response);
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os prompts.");
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (reason) {
      setCategories([]);
      console.error("Falha ao carregar prompts:", reason);
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const visibleCategories = useMemo(() => categories?.filter((category) => category.type === type) ?? [], [categories, type]);
  const allPrompts = useMemo(() => categories.flatMap((category) => category.prompts), [categories]);
  const selectedIndex = selected ? allPrompts.findIndex((prompt) => prompt.id === selected.id) : -1;
  const formCategories = categories?.filter((category) => category.type === form.type) ?? [];

  function closeSelected() {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    transitionTimer.current = null;
    setModalTransition("idle");
    setTransitionTarget(null);
    setTouchOffset(0);
    setTouchDirection(null);
    touchOffsetRef.current = 0;
    setSelected(null);
  }

  function navigatePrompt(direction: -1 | 1) {
    if (modalTransition !== "idle" || selectedIndex < 0) return;
    const nextIndex = selectedIndex + direction;
    if (nextIndex < 0 || nextIndex >= allPrompts.length) return;
    const movement = direction === 1 ? "next" : "previous";
    setTouchOffset(0);
    touchOffsetRef.current = 0;
    setTouchDirection(null);
    setTransitionTarget(allPrompts[nextIndex]);
    setModalTransition(movement);
    transitionTimer.current = window.setTimeout(() => {
      setSelected(allPrompts[nextIndex]);
      setTransitionTarget(null);
      setCopied(false);
      transitionTimer.current = null;
      setModalTransition("idle");
    }, 320);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (modalTransition !== "idle") return;
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    touchAxis.current = null;
    touchOffsetRef.current = 0;
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (!touchStart.current || modalTransition !== "idle") return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    if (!touchAxis.current && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
      touchAxis.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
    if (touchAxis.current !== "horizontal") return;
    event.preventDefault();
    const direction = deltaX < 0 ? 1 : -1;
    const nextIndex = selectedIndex + direction;
    const hasTarget = nextIndex >= 0 && nextIndex < allPrompts.length;
    touchOffsetRef.current = deltaX;
    setTouchOffset(deltaX);
    setTouchDirection(hasTarget ? direction : null);
    setTransitionTarget(hasTarget ? allPrompts[nextIndex] : null);
  }

  function handleTouchEnd() {
    if (!touchStart.current) return;
    const offset = touchOffsetRef.current;
    const direction = offset < 0 ? 1 : -1;
    const nextIndex = selectedIndex + direction;
    const shouldNavigate = Math.abs(offset) >= 72 && nextIndex >= 0 && nextIndex < allPrompts.length;
    touchStart.current = null;
    touchAxis.current = null;
    if (shouldNavigate) {
      navigatePrompt(direction);
      return;
    }
    touchOffsetRef.current = 0;
    setTouchOffset(0);
    setTouchDirection(null);
    setTransitionTarget(null);
  }

  useEffect(() => () => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
  }, []);

  useEffect(() => {
    if (!selected) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSelected();
      if (event.key === "ArrowLeft") navigatePrompt(-1);
      if (event.key === "ArrowRight") navigatePrompt(1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, selectedIndex, allPrompts, modalTransition]);

  function openNewPrompt() {
    setEditing(null);
    setForm(emptyForm);
    setImage(null);
    setPdf(null);
    setPdfStatus("idle");
    setAnalysisToken(null);
    setAnalysisImageUrl(null);
    setPromptModal(true);
  }

  function openEditPrompt(prompt: Prompt, category: Category) {
    setEditing(prompt);
    setForm({ name: prompt.name, type: category.type, categoryId: category.id, description: prompt.description, promptText: prompt.promptText, isFree: prompt.isFree });
    setImage(null);
    setPdf(null);
    setPdfStatus("idle");
    setAnalysisToken(null);
    setAnalysisImageUrl(null);
    setPromptModal(true);
  }

  async function handlePdfChange(file: File | null) {
    setPdf(file);
    setAnalysisToken(null);
    setAnalysisImageUrl(null);
    if (!file) {
      setPdfStatus("idle");
      return;
    }
    setPdfStatus("reading");
    try {
      const body = new FormData();
      body.append("pdf", file);
      const response = await fetch(withBasePath("/api/prompts/analysis"), { method: "POST", body });
      const data = await responseJson(response);
      if (!response.ok) throw new Error(data.error || "Não foi possível ler o PDF.");
      setForm((current) => ({
        ...current,
        name: String(data.fields?.name ?? current.name),
        description: String(data.fields?.description ?? current.description),
        promptText: String(data.fields?.promptText ?? current.promptText),
      }));
      setAnalysisToken(String(data.analysisToken));
      setAnalysisImageUrl(withBasePath(String(data.imageUrl)));
      setPdfStatus("ready");
    } catch (reason) {
      setPdf(null);
      setPdfStatus("error");
      setError(reason instanceof Error ? reason.message : "Não foi possível ler o PDF.");
    }
  }

  async function submitPrompt(event: React.FormEvent) {
    event.preventDefault();
    if (!form.type) { setError("O campo Tipo não pode ficar em branco."); return; }
    if (!form.categoryId) { setError("O campo Categoria não pode ficar em branco."); return; }
    if (pdfStatus === "reading") { setError("Aguarde a IA terminar a leitura do PDF."); return; }
    if (pdf && pdfStatus !== "ready") { setError("Aguarde a validação do PDF antes de salvar."); return; }
    if (pdf && !analysisToken) { setError("O PDF precisa ser analisado antes de salvar."); return; }
    if (!form.name.trim()) { setError("Informe o nome do prompt."); return; }
    if (!form.description.trim()) { setError("Informe a descrição do prompt."); return; }
    if (!form.promptText.trim()) { setError("Informe o texto do prompt."); return; }
    if (!editing && !analysisToken && !image) { setError("A foto do prompt é obrigatória."); return; }
    setSending(true);
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("type", form.type);
      body.append("categoryId", form.categoryId);
      body.append("description", form.description);
      body.append("promptText", form.promptText);
      body.append("isFree", String(form.isFree));
      if (analysisToken) body.append("analysisToken", analysisToken);
      else if (image) body.append("image", image);
      const endpoint = editing ? `/api/prompts/${editing.id}` : "/api/prompts";
      const response = await fetch(withBasePath(endpoint), { method: editing ? "PATCH" : "POST", body });
      const data = await responseJson(response);
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar o prompt.");
      setPromptModal(false);
      await load();
      setSuccess(editing ? "Prompt atualizado com sucesso." : "Prompt criado com sucesso.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  async function submitCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryType) { setError("O campo Tipo não pode ficar em branco."); return; }
    setSending(true);
    try {
      const endpoint = editingCategoryId ? `/api/prompt-categories/${editingCategoryId}` : "/api/prompt-categories";
      const response = await fetch(withBasePath(endpoint), {
        method: editingCategoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName, type: categoryType }),
      });
      const data = await responseJson(response);
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a categoria.");
      const shouldReturnToPrompt = returnToPrompt;
      setCategoryModal(null);
      setCategoryType("");
      setEditingCategoryId(null);
      setCategoryName("");
      setReturnToPrompt(false);
      await load();
      if (shouldReturnToPrompt && data.category) {
        setForm((current) => ({ ...current, type: data.category.type, categoryId: data.category.id }));
        setPromptModal(true);
      }
      setSuccess("Categoria criada com sucesso.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  async function removeConfirmed() {
    if (!confirm) return;
    setSending(true);
    try {
      const endpoint = confirm.kind === "prompt" ? `/api/prompts/${confirm.id}` : `/api/prompt-categories/${confirm.id}`;
      const response = await fetch(withBasePath(endpoint), { method: "DELETE" });
      const data = await responseJson(response);
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir.");
      setConfirm(null);
      await load();
      setSuccess(`${confirm.kind === "prompt" ? "Prompt" : "Categoria"} excluído com sucesso.`);
    } catch (reason) {
      setConfirm(null);
      setError(reason instanceof Error ? reason.message : "Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  async function copyPrompt(prompt: Prompt) {
    await navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function reorderCategory(category: Category, direction: -1 | 1) {
    const index = visibleCategories.findIndex((item) => item.id === category.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= visibleCategories.length) return;
    const order = visibleCategories.map((item) => item.id);
    [order[index], order[target]] = [order[target], order[index]];
    setSending(true);
    try {
      const response = await fetch(withBasePath("/api/prompt-categories/reorder"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, order }),
      });
      const data = await responseJson(response);
      if (!response.ok) throw new Error(data.error || "Não foi possível organizar as categorias.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  async function reorderPrompt(category: Category, prompt: Prompt, direction: -1 | 1) {
    const index = category.prompts.findIndex((item) => item.id === prompt.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= category.prompts.length) return;
    const order = category.prompts.map((item) => item.id);
    [order[index], order[target]] = [order[target], order[index]];
    setSending(true);
    try {
      const response = await fetch(withBasePath("/api/prompts/reorder"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: category.id, order }),
      });
      const data = await responseJson(response);
      if (!response.ok) throw new Error(data.error || "Não foi possível organizar os prompts.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  function renderPromptContent(prompt: Prompt) {
    const promptPosition = allPrompts.findIndex((item) => item.id === prompt.id) + 1;
    return (
      <div className="relative">
        <span className="absolute right-10 top-0 text-xs font-bold tracking-wider text-zinc-500">Prompt {promptPosition} de {allPrompts.length}</span>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Visualização do prompt</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{prompt.name}</h2>
          </div>
          <button type="button" onClick={closeSelected} className="text-xl text-zinc-500 hover:text-white">✕</button>
        </div>
        <img src={prompt.imageUrl} alt="" className="mx-auto mt-5 max-h-80 max-w-full rounded-xl object-contain" />
        <p className="mt-5 text-base leading-relaxed text-zinc-300">{prompt.description}</p>
        <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{prompt.promptText}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => copyPrompt(prompt)} className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-bold text-zinc-950">
            {copied ? "Prompt copiado" : "Copiar prompt"}
          </button>
          <a href={prompt.pdfUrl} className="rounded-xl border border-violet-400/30 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">Baixar PDF</a>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-6 space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row">
        <button type="button" onClick={openNewPrompt} className="w-full rounded-lg border border-violet-400/30 bg-white/[0.025] px-4 py-3 text-sm font-medium text-violet-200 hover:border-violet-300/60 hover:bg-violet-500/[0.08] sm:w-auto">＋ Criar prompt</button>
         <button type="button" onClick={() => { setCategoryModal("EDITING"); setCategoryType(""); setEditingCategoryId(null); setReturnToPrompt(false); setCategoryName(""); }} className="w-full rounded-lg border border-violet-400/30 bg-white/[0.025] px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-white/5 sm:w-auto">＋ Criar categoria</button>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-violet-400/20 bg-zinc-900 p-2">
        {([
          ["EDITING", "Prompts para edição"],
          ["CREATION", "Prompts para criação"],
        ] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setType(key)} className={`rounded-xl px-3 py-3 text-sm font-bold transition sm:text-base ${type === key ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-zinc-950" : "text-zinc-300 hover:bg-white/5"}`}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-base text-zinc-400">Carregando categorias...</div>
      ) : visibleCategories.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-base text-zinc-400">
          Nenhuma categoria criada para este tipo ainda. Use “Criar categoria” para começar.
        </div>
      ) : (
        <div className="space-y-4">
          {visibleCategories.map((category) => (
        <div key={category.id} className="rounded-xl border border-zinc-800/80 bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">{category.name}</h2>
             <div className="flex flex-wrap items-center gap-2">
               <span className="mr-1 text-xs text-zinc-500">Organizar</span>
               <button type="button" title="Subir categoria" disabled={sending || visibleCategories.findIndex((item) => item.id === category.id) === 0} onClick={() => reorderCategory(category, -1)} className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30">↑</button>
               <button type="button" title="Descer categoria" disabled={sending || visibleCategories.findIndex((item) => item.id === category.id) === visibleCategories.length - 1} onClick={() => reorderCategory(category, 1)} className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-30">↓</button>
               <button type="button" onClick={() => { setCategoryModal(category.type); setCategoryType(category.type); setEditingCategoryId(category.id); setCategoryName(category.name); }} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">Editar</button>
              <button type="button" onClick={() => setConfirm({ kind: "category", id: category.id, name: category.name })} className="text-sm font-semibold text-red-400 hover:text-red-300">Excluir</button>
            </div>
          </div>
          {category.prompts.length === 0 ? <p className="mt-3 text-sm text-zinc-500">Nenhum prompt nesta categoria.</p> : (
             <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                   {category.prompts.map((prompt, promptIndex) => (
                 <div key={prompt.id} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={prompt.imageUrl} alt="" className="h-auto w-auto max-h-16 max-w-16 shrink-0 rounded-lg object-contain" />
                      <div className="min-w-0">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${prompt.isFree ? "bg-emerald-500/15 text-emerald-300" : "bg-violet-500/15 text-violet-300"}`}>{prompt.isFree ? "FREE" : "FULL"}</span>
                        <span className="mt-1 block line-clamp-2 text-sm font-semibold text-zinc-100">{prompt.name}</span>
                      </div>
                   </div>
                    <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-zinc-800 pt-2">
                       <button type="button" title="Subir prompt" disabled={sending || promptIndex === 0} onClick={() => reorderPrompt(category, prompt, -1)} className="text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30">↑</button>
                       <button type="button" title="Descer prompt" disabled={sending || promptIndex === category.prompts.length - 1} onClick={() => reorderPrompt(category, prompt, 1)} className="text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30">↓</button>
                       <button type="button" onClick={() => { closeSelected(); setSelected(prompt); setCopied(false); }} className="text-xs font-semibold text-violet-300 hover:text-violet-200">Visualizar</button>
                     <button type="button" onClick={() => openEditPrompt(prompt, category)} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">Editar</button>
                     <button type="button" onClick={() => setConfirm({ kind: "prompt", id: prompt.id, name: prompt.name })} className="text-xs font-semibold text-red-400 hover:text-red-300">Excluir</button>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
          ))}
        </div>
      )}

       {selected && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={closeSelected}>
            <div className="relative w-full max-w-3xl sm:w-[calc(100%-5rem)]" onClick={(event) => event.stopPropagation()}>
              <div className="mb-2 flex items-center justify-between sm:contents">
                <button type="button" aria-label="Prompt anterior" disabled={selectedIndex <= 0 || modalTransition !== "idle"} onClick={() => navigatePrompt(-1)} className="relative z-10 flex h-8 w-8 items-center justify-center text-2xl leading-none text-violet-300 transition hover:text-cyan-300 disabled:pointer-events-none disabled:opacity-20 sm:absolute sm:-left-11 sm:top-1/2 sm:-translate-y-1/2">
                  <span aria-hidden="true">&lt;</span>
                </button>
                <button type="button" aria-label="Próximo prompt" disabled={selectedIndex < 0 || selectedIndex >= allPrompts.length - 1 || modalTransition !== "idle"} onClick={() => navigatePrompt(1)} className="relative z-10 flex h-8 w-8 items-center justify-center text-2xl leading-none text-violet-300 transition hover:text-cyan-300 disabled:pointer-events-none disabled:opacity-20 sm:absolute sm:-right-11 sm:top-1/2 sm:-translate-y-1/2">
                  <span aria-hidden="true">&gt;</span>
                </button>
              </div>
              <div className="relative max-h-[calc(92vh-2.5rem)] w-full overflow-y-auto rounded-2xl border border-violet-400/30 bg-zinc-900 p-5 shadow-2xl sm:max-h-[92vh] sm:p-7" style={{ touchAction: "pan-y" }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}>
                <div className={modalTransition === "idle" && touchOffset === 0 ? "" : modalTransition === "idle" ? "" : "prompt-modal-fade-out"} style={touchOffset !== 0 ? { opacity: Math.max(0.15, 1 - Math.abs(touchOffset) / 220), transition: "none" } : undefined}>{renderPromptContent(selected)}</div>
               {transitionTarget && <div className={touchOffset !== 0 ? "absolute inset-0 bg-zinc-900 p-5" : `absolute inset-0 bg-zinc-900 p-5 sm:p-7 prompt-modal-enter-${modalTransition}`} style={touchOffset !== 0 ? { transform: `translateX(calc(${touchDirection === 1 ? "100%" : "-100%"} + ${touchOffset}px))`, opacity: Math.min(1, Math.abs(touchOffset) / 72), transition: "none" } : undefined}>{renderPromptContent(transitionTarget)}</div>}
             </div>
           </div>
         </div>
       )}

      {promptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => !sending && setPromptModal(false)}>
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-violet-400/30 bg-zinc-900 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white">{editing ? "Editar prompt" : "Criar prompt"}</h2><button type="button" onClick={() => setPromptModal(false)} className="text-xl text-zinc-500 hover:text-white">✕</button></div>
            <form onSubmit={submitPrompt} className="mt-5 space-y-4">
               <div className="grid gap-4 sm:grid-cols-2">
                 <div><label className="block text-sm font-semibold text-zinc-200">Tipo *</label><div className="mt-2"><SelectField value={form.type} onChange={(value) => { const nextType = value as PromptType; setForm({ ...form, type: nextType, categoryId: "" }); }} disabled={sending} options={[{ value: "EDITING", label: "Edição" }, { value: "CREATION", label: "Criação" }]} /></div></div>
                 <div><label className="block text-sm font-semibold text-zinc-200">Categoria *</label><div className="mt-2"><SelectField value={form.categoryId} onChange={(value) => { if (value === "__create__") { if (!form.type) { setError("Escolha o Tipo antes de criar uma categoria."); return; } setCategoryModal(form.type); setCategoryType(""); setEditingCategoryId(null); setReturnToPrompt(true); setCategoryName(""); setPromptModal(false); return; } setForm({ ...form, categoryId: value }); }} disabled={sending} options={[{ value: "__create__", label: "＋ Criar categoria", action: true }, ...formCategories.map((category) => ({ value: category.id, label: category.name }))]} /></div></div>
               </div>
               <div><label className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-sm font-semibold text-zinc-200"><input type="checkbox" checked={form.isFree} onChange={(event) => setForm({ ...form, isFree: event.target.checked })} disabled={sending} className="h-5 w-5 accent-emerald-500" />Prompt gratuito</label><p className="mt-2 text-xs text-zinc-500">Desmarque para disponibilizar somente no plano FULL.</p></div>
               <div><label className="block text-sm font-semibold text-zinc-200">Nome *</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required={pdfStatus !== "reading"} disabled={sending || pdfStatus === "reading"} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-violet-400" /></div>
               <div><label className="block text-sm font-semibold text-zinc-200">Foto *</label><div className="mt-2">{analysisImageUrl ? <div className="flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-zinc-950 p-3"><img src={analysisImageUrl} alt="Foto extraída do PDF" className="h-24 w-24 rounded-lg object-contain" /><div><p className="text-sm font-semibold text-emerald-300">Foto extraída do PDF</p><p className="mt-1 text-xs text-zinc-500">Esta miniatura será usada para gerar o PDF.</p></div></div> : pdfStatus === "reading" ? <div className="rounded-xl border border-violet-400/30 bg-zinc-950 p-4 text-sm text-violet-200">A foto será extraída do PDF após a leitura.</div> : <FilePickerField accept="image/jpeg,image/png,image/webp" file={image} onChange={setImage} disabled={sending} hint={editing ? "JPG, PNG ou WebP. Selecione apenas para substituir." : "JPG, PNG ou WebP, até 10 MB."} actionLabel={editing ? "Substituir foto" : "Escolher foto"} />}</div></div>
               <div><label className="block text-sm font-semibold text-zinc-200">Descrição *</label><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required={pdfStatus !== "reading"} disabled={sending || pdfStatus === "reading"} rows={4} placeholder="Descrição do resultado visual esperado." className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400" /></div>
                <div><label className="block text-sm font-semibold text-zinc-200">Texto do prompt *</label><textarea value={form.promptText} onChange={(event) => setForm({ ...form, promptText: event.target.value })} required={pdfStatus !== "reading"} disabled={sending || pdfStatus === "reading"} rows={7} placeholder="Digite aqui o prompt completo que será copiado pelo aluno." className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-violet-400" /></div>
               <div className="flex items-center gap-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500"><span className="h-px flex-1 bg-zinc-700" /><span>ou</span><span className="h-px flex-1 bg-zinc-700" /></div>
                <div><label className="block text-sm font-semibold text-zinc-200">PDF do prompt</label><div className="mt-2"><FilePickerField accept="application/pdf" file={pdf} onChange={handlePdfChange} disabled={sending || pdfStatus === "reading"} hint={editing ? "Ao enviar um PDF, a foto será extraída e o PDF será reescrito ao salvar." : "PDF, até 25 MB. A foto e o prompt precisam estar dentro dele."} actionLabel={editing ? "Substituir PDF" : "Enviar PDF"} /></div>{pdfStatus === "reading" && <p role="status" aria-live="polite" className="mt-3 rounded-xl border border-violet-400/30 bg-violet-500/10 p-3 text-sm font-semibold text-violet-200">Aguarde: a IA está lendo o PDF e completando os campos. Não feche esta janela.</p>}<p className="mt-2 text-xs text-amber-300">Importante: o PDF precisa conter a foto e o prompt. Nome, descrição e outros campos vazios serão preenchidos usando somente o texto do prompt.</p>{pdfStatus === "ready" && <p className="mt-2 text-xs text-emerald-300">PDF aprovado. Você pode revisar e editar os campos antes de salvar.</p>}{pdfStatus === "error" && <p className="mt-2 text-xs text-red-300">Envie outro PDF para tentar novamente.</p>}</div>
                <div className="flex flex-wrap gap-3 pt-2"><button type="submit" disabled={sending || pdfStatus === "reading"} className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50">{sending ? "Salvando..." : "Salvar prompt"}</button><button type="button" onClick={() => setPromptModal(false)} disabled={sending} className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}

      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => !sending && setCategoryModal(null)}>
           <div className="w-full max-w-md rounded-2xl border border-violet-400/30 bg-zinc-900 p-6" onClick={(event) => event.stopPropagation()}><h2 className="text-xl font-bold text-white">{editingCategoryId ? "Editar categoria" : "Criar categoria"}</h2><form onSubmit={submitCategory} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-zinc-200">Nome da categoria *</label><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required disabled={sending} placeholder="Nome da categoria" className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" />{!editingCategoryId && <><label className="block text-sm font-semibold text-zinc-200">Tipo *</label><SelectField value={categoryType} onChange={(value) => setCategoryType(value as PromptType)} disabled={sending} options={[{ value: "EDITING", label: "Prompts para edição" }, { value: "CREATION", label: "Prompts para criação" }]} /></>}<div className="flex gap-3"><button type="submit" disabled={sending} className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50">Salvar</button><button type="button" onClick={() => { setCategoryModal(null); setCategoryType(""); setEditingCategoryId(null); setReturnToPrompt(false); }} className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5">Cancelar</button></div></form></div>
        </div>
      )}

      {confirm && <ConfirmModal title={`Excluir ${confirm.kind === "prompt" ? "prompt" : "categoria"}`} message={`Excluir ${confirm.kind === "prompt" ? "o prompt" : "a categoria"} \"${confirm.name}\"? Essa ação não pode ser desfeita.`} confirmLabel="Excluir" danger onConfirm={removeConfirmed} onCancel={() => setConfirm(null)} />}
      {success && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-zinc-900 p-6 shadow-2xl"><div className="flex items-center gap-3"><span className="text-2xl text-emerald-400">✓</span><p className="text-base font-bold text-emerald-300">{success}</p></div></div></div>}
       {error && <ErrorModal message={error} onClose={() => setError(null)} autoCloseMs={pdfStatus === "error" ? 8000 : 2000} />}
    </section>
  );
}
