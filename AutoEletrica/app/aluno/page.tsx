"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MODULES } from "@/lib/modules";
import AiChatModal from "@/app/components/AiChatModal";
import ErrorModal from "@/app/components/ErrorModal";
import QuizResultModal from "@/app/components/QuizResultModal";
import ComunidadeTab from "@/app/components/ComunidadeTab";

type Session = { userId: string; role: string; name: string };

type Material = {
  id: string;
  order: number;
  name: string;
  description: string | null;
  synopsis: string | null;
  pdfUrl: string | null;
  createdAt: string;
};

type Question = {
  id: string;
  questionText: string;
  answerText: string | null;
  status: "open" | "answered";
  createdAt: string;
};

type Quiz = {
  id: string;
  moduleOrder: number;
  moduleName: string;
  title: string;
  source: string;
  questionCount: number;
};

type QuizDetail = {
  id: string;
  moduleOrder: number;
  title: string;
  questions: {
    id: string;
    question: string;
    order: number;
    options: { id: string; text: string; order: number }[];
  }[];
};

type Tab = "conteudo" | "duvidas" | "desempenho" | "comunidade";

export default function StudentPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("conteudo");

  
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
        if (data?.user?.role !== "student") {
          router.replace("/professor");
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
    { key: "duvidas", label: "Canal de Dúvidas", icon: "💬" },
    { key: "comunidade", label: "Comunidade", icon: "👥" },
    { key: "desempenho", label: "Desempenho", icon: "📊" },
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
          Escolha uma seção para continuar seus estudos.
        </p>

        {tab === "conteudo" && <ConteudoTab />}
        {tab === "duvidas" && <DuvidasTab userId={session!.userId} />}
        {tab === "comunidade" && <ComunidadeTab session={session!} />}
        {tab === "desempenho" && <DesempenhoTab />}
      </div>

      <footer className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/icoauto-icon.png" alt="" className="h-7 w-7 rounded-lg" />
              <span className="text-xs font-bold text-white">
                Auto <span className="text-amber-400">Elétrica</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <Link href="/" className="transition hover:text-white">Voltar ao início</Link>
            </div>
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Auto Elétrica. Elétrica & Injeção Eletrônica Automotiva</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ConteudoTab() {
  const [modules, setModules] = useState<any[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch(`/api/modules/public?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setModules(d.modules))
      .catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") setRefreshKey((k) => k + 1);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const numStr = (n: number) => String(n).padStart(2, "0");

  if (!modules) {
    return (
      <section className="mt-6 space-y-4">
        <p className="text-base text-zinc-500">Carregando módulos...</p>
      </section>
    );
  }

  if (modules.length === 0) {
    return (
      <section className="mt-6 space-y-4">
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
          Nenhum módulo disponível ainda.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-base leading-relaxed text-zinc-300">
        Conteúdo baseado no livro{" "}
        <span className="font-semibold text-white">
          "Injeção Eletrônica — Os Fundamentos"
        </span>
        . Clique em <span className="font-semibold text-white">Visualizar</span> para
        estudar o conteúdo completo de cada módulo.
      </p>

      <div className="grid gap-4">
        {modules.map((mod: any) => (
          <article
            key={mod.order}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-xl">
                    {mod.icon}
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
                      Módulo {numStr(mod.order)}
                    </p>
                    <h2 className="text-2xl font-bold text-white">{mod.name}</h2>
                  </div>
                </div>
                {mod.description ? (
                  <p className="mt-2 text-base leading-relaxed text-zinc-400">
                    {mod.description}
                  </p>
                ) : mod.synopsis ? (
                  <p className="mt-2 text-base leading-relaxed text-zinc-400">
                    {mod.synopsis}
                  </p>
                ) : mod.summary ? (
                  <p className="mt-2 text-base leading-relaxed text-zinc-400">
                    {mod.summary}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-zinc-500">
                  {mod.submodules.length} submódulos
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <a
                href={`/conteudo/${mod.order}`}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5"
              >
                Visualizar
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function ModulesTab() {
  const [modules, setModules] = useState<Material[] | null>(null);
  const [error, setError] = useState("");
  const [chatModule, setChatModule] = useState<Material | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/modules?t=${Date.now()}`);
      if (!res.ok) {
        setError("Erro ao carregar módulos");
        return;
      }
      const data = await res.json();
      setModules(data.modules);
    } catch {
      setError("Falha de conexão");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") setRefreshKey((k) => k + 1);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (error) {
    return <p className="text-base text-red-400">{error}</p>;
  }
  if (!modules) {
    return <p className="text-base text-zinc-500">Carregando módulos...</p>;
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-base leading-relaxed text-zinc-300">
          Os módulos do curso estão logo abaixo. Cada módulo tem sua apostila em
          PDF: clique em <span className="font-semibold text-white">Visualizar</span>{" "}
          para ler on-line ou <span className="font-semibold text-white">Baixar</span>{" "}
          para salvar no celular.
        </p>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="shrink-0 ml-3 grid h-10 w-10 place-items-center rounded-xl border border-zinc-700 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          title="Atualizar lista"
        >
          ↻
        </button>
      </div>

      {modules.length === 0 && (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
          Nenhum módulo publicado ainda. O professor vai liberar em breve.
        </p>
      )}

      <div className="grid gap-4">
        {modules.map((mod) => (
          <article
            key={mod.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-xl font-black text-amber-400">
                    {mod.order}
                  </span>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
                      Módulo
                    </p>
                    <h2 className="text-2xl font-bold text-white">{mod.name}</h2>
                  </div>
                </div>
                {mod.description ? (
                  <pre className="mt-3 whitespace-pre-line text-base leading-relaxed text-zinc-400">
                    {mod.description}
                  </pre>
                ) : mod.synopsis ? (
                  <pre className="mt-3 whitespace-pre-line text-base leading-relaxed text-zinc-400">
                    {mod.synopsis}
                  </pre>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                {mod.pdfUrl ? (
                  <>
                    <a
                      href={mod.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-center text-base font-bold text-zinc-950 transition hover:-translate-y-0.5"
                    >
                      Visualizar
                    </a>
                    <a
                      href={mod.pdfUrl}
                      download
                      className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-base font-semibold text-zinc-200 transition hover:bg-white/5"
                    >
                      Baixar
                    </a>
                  </>
                ) : (
                  <p className="rounded-xl border border-zinc-800 px-5 py-3 text-base text-zinc-500">
                    PDF em breve
                  </p>
                )}
              </div>
            </div>
            {mod.pdfUrl && (
              <button
                onClick={() => setChatModule(mod)}
                className="mt-4 w-full rounded-xl border border-cyan-600/50 bg-cyan-500/10 px-5 py-3 text-base font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                💬 Estude com a IA sobre este módulo
              </button>
            )}
          </article>
        ))}
      </div>

      <AiChatModal module={chatModule} onClose={() => setChatModule(null)} />
    </section>
  );
}

function DuvidasTab({ userId: _userId }: { userId: string }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) {
        setModalError("Erro ao carregar dúvidas");
        return;
      }
      const data = await res.json();
      setQuestions(data.questions);
    } catch {
      setModalError("Falha de conexão");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao enviar dúvida");
        return;
      }
      setModalSuccess("Dúvida enviada com sucesso! Aguarde a resposta do professor.");
      load();
      setTimeout(() => {
        setCreating(false);
        setModalSuccess(null);
        setText("");
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-6 space-y-8">
      <button
        onClick={() => {
          setCreating(true);
          setError("");
          setModalSuccess(null);
        }}
        className="w-full rounded-2xl border-2 border-dashed border-amber-600/40 bg-zinc-900 p-6 text-lg font-bold text-amber-400 transition hover:border-amber-500/70 hover:bg-amber-500/10"
      >
        ＋ Enviar dúvida
      </button>

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (modalSuccess || sending) return;
            setCreating(false);
            setText("");
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {modalSuccess ? "Sucesso" : "Enviar dúvida"}
              </h2>
              {!modalSuccess && !sending && (
                <button
                  onClick={() => {
                    setCreating(false);
                    setText("");
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
                    Envie sua dúvida de bancada
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    required
                    minLength={5}
                    disabled={sending}
                    placeholder="Ex.: carro falha a frio no Módulo 2, mas quente funciona..."
                    className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                  />
                </div>

                {error && <p className="text-base text-red-400">{error}</p>}

                {sending && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                    <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                    <div>
                      <p className="text-sm font-bold text-amber-300">
                        Enviando sua dúvida, aguarde...
                      </p>
                      <p className="mt-0.5 text-xs text-amber-200/70">
                        A dúvida está sendo registrada e aparecerá no seu histórico.
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
                    {sending ? "Enviando..." : "Enviar dúvida"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(false);
                      setText("");
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

      {!questions ? (
        <p className="text-base text-zinc-500">Carregando histórico...</p>
      ) : questions.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
          Você ainda não tem dúvidas registradas.
        </p>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-white">Histórico</h2>
          <div className="mt-3 space-y-3">
            {questions.map((q) => (
              <article
                key={q.id}
                className={`rounded-2xl border p-5 ${
                  q.status === "answered"
                    ? "border-emerald-800/50 bg-emerald-950/20"
                    : "border-red-800/50 bg-red-950/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-semibold text-white">
                    {q.questionText}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      q.status === "answered"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {q.status === "answered" ? "Respondida" : "Aguardando"}
                  </span>
                </div>
                {q.answerText && (
                  <div className="mt-3 rounded-xl bg-zinc-950/60 p-4 text-base leading-relaxed text-zinc-300">
                    <p className="mb-1 text-xs uppercase tracking-wider text-emerald-400">
                      Resposta do professor
                    </p>
                    {q.answerText}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}
    </section>
  );
}

function AvaliacoesTab({ userId: _userId }: { userId: string }) {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [active, setActive] = useState<QuizDetail | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{
    total: number;
    correct: number;
    results: { questionId: string; correctIndex: number; chosen: number; isCorrect: boolean }[];
  } | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (!res.ok) {
        setError("Erro ao carregar avaliações");
        return;
      }
      const data = await res.json();
      setQuizzes(data.quizzes);
    } catch {
      setError("Falha de conexão");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function startQuiz(id: string) {
    setLoadingQuiz(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (!res.ok) throw new Error("Falha");
      const data = await res.json();
      setActive(data.quiz);
      setAnswers(new Array(data.quiz.questions.length).fill(-1));
    } catch {
      setError("Erro ao abrir avaliação");
    } finally {
      setLoadingQuiz(false);
    }
  }

  async function submitQuiz() {
    if (!active) return;
    setError("");
    setLoadingQuiz(true);
    try {
      const res = await fetch(`/api/quizzes/${active.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Erro ao corrigir avaliação");
    } finally {
      setLoadingQuiz(false);
    }
  }

  if (active) {
    return (
      <section className="mt-6 space-y-6">
        <button
          onClick={() => {
            setActive(null);
            setResult(null);
          }}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
        >
          ← Voltar
        </button>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold text-white">{active.title}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Módulo {active.moduleOrder} · {active.questions.length} perguntas
          </p>
        </div>

        {active.questions.map((q, qi) => (
          <div
            key={q.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <p className="text-lg font-semibold leading-relaxed text-white">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-4 space-y-2">
              {q.options.map((op, oi) => {
                const chosen = answers[qi] === oi;
                const isCorrect = !!result && result.results[qi]?.correctIndex === oi;
                const isWrongPick = !!result && chosen && result.results[qi]?.isCorrect === false && oi !== result.results[qi]?.correctIndex;
                return (
                  <button
                    key={op.id}
                    onClick={() => {
                      if (result) return;
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left text-base transition ${
                      !result
                        ? chosen
                          ? "border-amber-500 bg-amber-500/10 text-white"
                          : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-amber-500/50 hover:text-white"
                        : isCorrect
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : isWrongPick
                        ? "border-red-500/70 bg-red-500/10 text-white"
                        : "border-zinc-700 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current text-sm font-bold">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span>{op.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {result ? (
          <div
            className={`rounded-2xl border p-6 text-center ${
              result.correct >= Math.ceil(result.total / 2)
                ? "border-emerald-800/50 bg-emerald-950/20"
                : "border-amber-800/50 bg-amber-950/20"
            }`}
          >
            <p className="text-4xl font-black text-white">
              {result.correct}/{result.total}
            </p>
            <p className="mt-2 text-lg text-zinc-300">
              {result.correct >= Math.ceil(result.total / 2)
                ? "Mandou bem! Pode avançar."
                : "Continue revisando o conteúdo e tente de novo."}
            </p>
          </div>
        ) : (
          <>
            {loadingQuiz && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
                <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-amber-400 border-t-transparent" />
                <div>
                  <p className="text-base font-bold text-amber-300">
                    Corrigindo avaliação, aguarde...
                  </p>
                  <p className="mt-0.5 text-sm text-amber-200/70">
                    Suas respostas estão sendo corrigidas uma a uma.
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={submitQuiz}
              disabled={answers.some((a) => a === -1) || loadingQuiz}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-lg font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-40 sm:w-auto"
            >
              {loadingQuiz ? "Corrigindo..." : "Corrigir avaliação"}
            </button>
          </>
        )}
        {error && <p className="text-base text-red-400">{error}</p>}
      </section>
    );
  }

  return (
    <section className="mt-6">
      {error && <p className="mb-4 text-base text-red-400">{error}</p>}
      {!quizzes ? (
        <p className="text-base text-zinc-500">
          {loadingQuiz ? "Abrindo avaliação..." : "Carregando avaliações..."}
        </p>
      ) : quizzes.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
          Nenhuma avaliação disponível ainda.
        </p>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-white">
            Quizzes por módulo
          </h2>
          <p className="mt-1 text-base text-zinc-400">
            Teste seus conhecimentos ao fim de cada módulo.
          </p>
          <div className="mt-4 grid gap-3">
            {quizzes.map((q, i) => (
              <button
                key={q.id}
                onClick={() => startQuiz(q.id)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-amber-500/40 hover:bg-zinc-800/60"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-xl">
                    {MODULES.find((m) => m.id === q.moduleOrder)?.icon ?? "✅"}
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white">
                      {q.title}
                      {q.source === "ia" && (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                          IA
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-zinc-500">
                      Módulo {q.moduleOrder} · {q.moduleName} · {q.questionCount} perguntas
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-xl border border-zinc-700 px-4 py-2 text-base font-semibold text-amber-400">
                  Fazer →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

type AttemptItem = {
  id: string;
  correct: number;
  total: number;
  percentage: number;
  createdAt: string;
  moduleId: string;
  moduleOrder: number;
  moduleName: string;
  details: {
    title: string;
    questions: {
      question: string;
      options: { text: string }[];
      correctIndex: number;
      chosenIndex: number | null;
      isCorrect: boolean;
    }[];
  };
};

type PerformanceData = {
  attempts: AttemptItem[];
  summary: {
    attempts: number;
    average: number;
    studySeconds: number;
    modulesDone: number;
    passedModules: number;
  };
};

function formatStudyTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ""}`;
  return `${m}min`;
}

function DesempenhoTab() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [error, setError] = useState("");
  const [modalAttempt, setModalAttempt] = useState<AttemptItem | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/performance");
        if (!res.ok) {
          setError("Erro ao carregar desempenho");
          return;
        }
        const d = await res.json();
        setData(d);
      } catch {
        setError("Falha de conexão");
      }
    })();
  }, []);

  if (error) {
    return <p className="mt-6 text-base text-red-400">{error}</p>;
  }
  if (!data) {
    return <p className="mt-6 text-base text-zinc-500">Carregando desempenho...</p>;
  }

  const { summary, attempts } = data;
  const cards = [
    { label: "Média das notas", value: `${summary.average}%`, icon: "🎯" },
    { label: "Avaliações feitas", value: String(summary.attempts), icon: "📝" },
    { label: "Horas de estudo", value: formatStudyTime(summary.studySeconds), icon: "⏱️" },
    { label: "Módulos concluídos", value: String(summary.passedModules), icon: "🏆" },
  ];

  const groups: { order: number; name: string; items: AttemptItem[] }[] = [];
  attempts.forEach((a) => {
    const g = groups.find((x) => x.order === a.moduleOrder);
    if (g) g.items.push(a);
    else groups.push({ order: a.moduleOrder, name: a.moduleName, items: [a] });
  });

  return (
    <section className="mt-6 space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{c.label}</p>
              <span className="text-xl">{c.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-black text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-base leading-relaxed text-zinc-400">
        ⏱️ Suas <span className="font-semibold text-zinc-200">horas de estudo</span> são
        somadas enquanto você lê o conteúdo na aba{" "}
        <span className="font-semibold text-amber-400">Conteúdo</span> (com um módulo
        aberto). Cada avaliação corrigida aparece abaixo, organizada por módulo —
        clique em uma tentativa para rever o resumo.
      </p>

      {attempts.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
          Você ainda não fez nenhuma avaliação. Complete um módulo e teste seus
          conhecimentos na aba Avaliações. 💪
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => {
            const modAvg = Math.round(
              (g.items.reduce((s, a) => s + a.correct, 0) /
                g.items.reduce((s, a) => s + a.total, 0)) *
                100
            );
            return (
              <div
                key={g.order}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/70 bg-zinc-950/50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-lg">
                      {MODULES.find((m) => m.id === g.order)?.icon ?? "📘"}
                    </span>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
                        Módulo {g.order}
                      </p>
                      <p className="text-lg font-bold text-white">{g.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300">
                      {g.items.length}{" "}
                      {g.items.length === 1 ? "tentativa" : "tentativas"}
                    </span>
                    <span className="rounded-full border border-emerald-700 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300">
                      Média {modAvg}%
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-zinc-800/60">
                  {g.items.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setModalAttempt(a)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-zinc-800/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black ${
                            a.percentage >= 50
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                          }`}
                        >
                          {a.percentage}%
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-white">
                            {a.details.title} · {a.correct}/{a.total}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {new Date(a.createdAt).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm text-zinc-500">
                        Ver detalhes →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAttempt && (
        <QuizResultModal
          title={modalAttempt.details.title}
          percentage={modalAttempt.percentage}
          correct={modalAttempt.correct}
          total={modalAttempt.total}
          questions={modalAttempt.details.questions}
          onClose={() => setModalAttempt(null)}
        />
      )}
    </section>
  );
}
