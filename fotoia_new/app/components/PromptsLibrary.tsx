"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { withBasePath } from "@/lib/publicPath";

type PromptType = "EDITING" | "CREATION";
type Prompt = {
  id: string;
  name: string;
  imageUrl: string;
  pdfUrl: string;
  description: string;
  promptText: string;
  order: number;
  isNew: boolean;
};
type Category = { id: string; name: string; type: PromptType; order: number; prompts: Prompt[]; unreadCount: number };
type ModalTransition = "idle" | "next" | "previous";
type Props = { onUnreadCountChange?: (count: number) => void };

async function responseJson(response: Response): Promise<Record<string, any>> {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`O servidor respondeu com um formato inesperado (${response.status}).`);
  }
}

export default function PromptsLibrary({ onUnreadCountChange }: Props) {
  const [type, setType] = useState<PromptType>("EDITING");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalTransition, setModalTransition] = useState<ModalTransition>("idle");
  const [transitionTarget, setTransitionTarget] = useState<Prompt | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const [touchDirection, setTouchDirection] = useState<-1 | 1 | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchAxis = useRef<"horizontal" | "vertical" | null>(null);
  const touchOffsetRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    fetch(withBasePath("/api/prompts/public"), { signal: controller.signal })
      .then(async (res) => {
        const data = await responseJson(res);
        if (!res.ok) throw new Error(data.error || "Não foi possível carregar os prompts.");
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        setUnreadCount(Number(data.unreadCount) || 0);
      })
      .catch((reason) => {
        setCategories([]);
        console.error("Falha ao carregar prompts:", reason);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  const visibleCategories = useMemo(() => categories?.filter((category) => category.type === type) ?? [], [categories, type]);
  const allPrompts = useMemo(() => categories.flatMap((category) => category.prompts), [categories]);
  const selectedIndex = selected ? allPrompts.findIndex((prompt) => prompt.id === selected.id) : -1;

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

  async function markPromptSeen(prompt: Prompt) {
    if (!prompt.isNew) return;
    const response = await fetch(withBasePath(`/api/prompts/${prompt.id}/view`), { method: "POST" });
    if (!response.ok) return;
    setCategories((current) => current.map((category) => ({
      ...category,
      unreadCount: category.prompts.some((item) => item.id === prompt.id && item.isNew)
        ? Math.max(0, category.unreadCount - 1)
        : category.unreadCount,
      prompts: category.prompts.map((item) => item.id === prompt.id ? { ...item, isNew: false } : item),
    })));
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  function openPrompt(prompt: Prompt) {
    closeSelected();
    setSelected(prompt);
    setCopied(false);
    void markPromptSeen(prompt);
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
      void markPromptSeen(allPrompts[nextIndex]);
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

  async function copyPrompt(prompt: Prompt) {
    await navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function renderPromptContent(prompt: Prompt) {
    const promptPosition = allPrompts.findIndex((item) => item.id === prompt.id) + 1;
    return (
      <div className="relative">
        <span className="absolute right-10 top-0 text-xs font-bold tracking-wider text-zinc-500">Prompt {promptPosition} de {allPrompts.length}</span>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Prompt</p>
            <h2 className="mt-1 text-xl font-medium text-white">{prompt.name}</h2>
          </div>
          <button type="button" onClick={closeSelected} className="text-xl text-zinc-500 hover:text-white">✕</button>
        </div>
        <img src={prompt.imageUrl} alt="" className="mx-auto mt-5 max-h-80 max-w-full rounded-xl object-contain" />
        <p className="mt-5 text-base leading-relaxed text-zinc-300">{prompt.description}</p>
        <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{prompt.promptText}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => copyPrompt(prompt)} className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-medium text-zinc-950">
            {copied ? "Prompt copiado" : "Copiar prompt"}
          </button>
          <a href={prompt.pdfUrl} className="rounded-lg border border-violet-400/30 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5">
            Baixar PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-6 space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-violet-400/20 bg-white/[0.025] p-1">
        {([
           ["EDITING", "Prompts para edição"],
           ["CREATION", "Prompts para criação"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setType(key); closeSelected(); }}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition sm:text-base ${type === key ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-zinc-950" : "text-zinc-300 hover:bg-white/5"}`}
          >
             {label}
             {(() => {
               const count = categories.filter((category) => category.type === key).reduce((total, category) => total + category.unreadCount, 0);
               return count > 0 ? <span className="ml-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-semibold text-violet-200">{count}</span> : null;
             })()}
          </button>
        ))}
      </div>

      {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><div className="flex items-start justify-between gap-4"><span>{error}</span><button type="button" onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button></div></div>}

      {loading ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-base text-zinc-400">Carregando categorias...</p>
      ) : visibleCategories.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-base text-zinc-400">Nenhuma categoria criada para este tipo ainda.</p>
      ) : (
        visibleCategories.map((category) => (
          <div key={category.id} className="border-b border-zinc-800/80 pb-5">
             <h2 className="text-base font-medium text-white">
               {category.name}
               {category.unreadCount > 0 && <span className="ml-2 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-semibold text-violet-200">{category.unreadCount}</span>}
             </h2>
            {category.prompts.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">Nenhum prompt nesta categoria.</p>
            ) : (
               <div className="mt-4 grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-3">
                 {category.prompts.map((prompt) => (
                   <button
                     key={prompt.id}
                     type="button"
                       onClick={() => openPrompt(prompt)}
                     className="card-interactive flex w-full items-center gap-3 rounded-lg border border-zinc-800/80 bg-white/[0.02] p-2.5 text-left transition hover:border-violet-400/45 hover:bg-violet-500/[0.06]"
                   >
                     <img src={prompt.imageUrl} alt="" className="h-auto w-auto max-h-16 max-w-16 shrink-0 rounded-lg object-contain" />
                      <span className="min-w-0">
                        {prompt.isNew && <span className="block text-[10px] font-bold uppercase tracking-wider text-violet-300">Novo</span>}
                        <span className="line-clamp-2 text-sm font-medium text-zinc-100">{prompt.name}</span>
                      </span>
                   </button>
                 ))}
               </div>
            )}
          </div>
        ))
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
            <div className="relative max-h-[calc(92vh-2.5rem)] w-full overflow-y-auto rounded-xl border border-violet-400/30 bg-zinc-900 p-5 shadow-2xl sm:max-h-[92vh] sm:p-7" style={{ touchAction: "pan-y" }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}>
              <div className={modalTransition === "idle" && touchOffset === 0 ? "" : modalTransition === "idle" ? "" : "prompt-modal-fade-out"} style={touchOffset !== 0 ? { opacity: Math.max(0.15, 1 - Math.abs(touchOffset) / 220), transition: "none" } : undefined}>{renderPromptContent(selected)}</div>
              {transitionTarget && <div className={touchOffset !== 0 ? "absolute inset-0 bg-zinc-900 p-5" : `absolute inset-0 bg-zinc-900 p-5 sm:p-7 prompt-modal-enter-${modalTransition}`} style={touchOffset !== 0 ? { transform: `translateX(calc(${touchDirection === 1 ? "100%" : "-100%"} + ${touchOffset}px))`, opacity: Math.min(1, Math.abs(touchOffset) / 72), transition: "none" } : undefined}>{renderPromptContent(transitionTarget)}</div>}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
