"use client";

import { useCallback, useEffect, useState } from "react";
import { Question } from "./types";
import ErrorModal from "./ErrorModal";

type StudentGroup = {
  student: { id: string; name: string };
  pending: Question[];
  answered: Question[];
};

function groupByStudent(questions: Question[]): StudentGroup[] {
  const map = new Map<string, StudentGroup>();
  for (const q of questions) {
    const key = q.user.id;
    if (!map.has(key)) {
      map.set(key, { student: q.user, pending: [], answered: [] });
    }
    const g = map.get(key)!;
    if (q.status === "answered") g.answered.push(q);
    else g.pending.push(q);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.pending.length > 0 && b.pending.length === 0) return -1;
    if (a.pending.length === 0 && b.pending.length > 0) return 1;
    return b.pending.length - a.pending.length || a.student.name.localeCompare(b.student.name);
  });
}

export default function QuestionsManager() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentGroup | null>(null);

  // Modal answering state
  const [answeringQuestion, setAnsweringQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [sending, setSending] = useState(false);
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
      // Update selectedStudent if open
      setSelectedStudent((prev) => {
        if (!prev) return null;
        const updatedGroups = groupByStudent(data.questions);
        return updatedGroups.find((g) => g.student.id === prev.student.id) || null;
      });
    } catch {
      setModalError("Falha de conexão");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answeringQuestion || !answerText.trim()) return;
    if (answerText.trim().length < 5) {
      setError("Escreva a resposta (mínimo 5 caracteres)");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch(`/api/questions/${answeringQuestion.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerText: answerText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao responder");
        return;
      }
      setModalSuccess("Dúvida respondida com sucesso!");
      load();
      setTimeout(() => {
        setAnsweringQuestion(null);
        setAnswerText("");
        setModalSuccess(null);
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  if (!questions) {
    return <p className="mt-6 text-base text-zinc-500">Carregando dúvidas...</p>;
  }

  const groups = groupByStudent(questions);

  return (
    <section className="mt-6 space-y-6">
      {error && <p className="text-base text-red-400">{error}</p>}

      {selectedStudent ? (
        <div className="space-y-6">
          <button
            onClick={() => {
              setSelectedStudent(null);
              setError("");
            }}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-lg font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            ← Voltar para lista de alunos
          </button>

          <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-600/40 bg-amber-500/10 text-lg font-black text-amber-400">
              {selectedStudent.student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedStudent.student.name}</h2>
              <div className="mt-1 flex items-center gap-3">
                <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 ring-1 ring-red-500/40">
                  {selectedStudent.pending.length} pendente(s)
                </span>
                {selectedStudent.pending.length === 0 && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">
                    OK
                  </span>
                )}
              </div>
            </div>
          </div>

          {selectedStudent.pending.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Dúvidas pendentes</h3>
              {selectedStudent.pending.map((q) => (
                <article key={q.id} className="rounded-2xl border border-red-600/40 bg-red-950/20 p-6 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-lg font-bold text-white">{q.questionText}</p>
                    <button
                      onClick={() => {
                        setAnsweringQuestion(q);
                        setAnswerText("");
                        setError("");
                      }}
                      className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5 shadow-lg shadow-orange-600/20"
                    >
                      Responder
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Enviado em {new Date(q.createdAt).toLocaleDateString("pt-BR")} às {new Date(q.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </article>
              ))}
            </div>
          )}

          {selectedStudent.answered.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Dúvidas respondidas</h3>
              {selectedStudent.answered.map((q) => (
                <article key={q.id} className="rounded-2xl border border-emerald-800/40 bg-zinc-900 p-6">
                  <p className="text-base font-bold text-white">{q.questionText}</p>
                  <div className="mt-3 rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 text-base leading-relaxed text-zinc-200">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Resposta do professor
                    </p>
                    {q.answerText}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Alunos com dúvidas{" "}
            <span className="ml-2 rounded-full bg-amber-500/20 px-4 py-1.5 text-lg font-black text-amber-300 ring-1 ring-amber-500/30">
              {groups.length}
            </span>
          </h2>

          {groups.length === 0 ? (
            <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
              Nenhuma dúvida registrada. 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <button
                  key={g.student.id}
                  onClick={() => setSelectedStudent(g)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-amber-600/60 hover:bg-amber-500/5 shadow-md"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-600/40 bg-amber-500/10 text-lg font-black text-amber-400">
                    {g.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-white truncate">{g.student.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {g.pending.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 ring-1 ring-red-500/40">
                          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                          {g.pending.length} pendente(s)
                        </span>
                      )}
                      {g.pending.length === 0 && g.answered.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/40">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          OK
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xl font-bold text-zinc-500">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Answer Modal */}
      {answeringQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (modalSuccess || sending) return;
            setAnsweringQuestion(null);
            setAnswerText("");
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {modalSuccess ? "Sucesso" : "Responder dúvida"}
              </h2>
              {!modalSuccess && !sending && (
                <button
                  onClick={() => {
                    setAnsweringQuestion(null);
                    setAnswerText("");
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
              <form onSubmit={handleAnswerSubmit} className="mt-5 space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Pergunta do aluno</p>
                  <p className="mt-1 text-base font-semibold text-white">{answeringQuestion.questionText}</p>
                </div>

                <div>
                  <label className="block text-base font-semibold text-zinc-200">
                    Sua resposta
                  </label>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={4}
                    required
                    minLength={5}
                    disabled={sending}
                    placeholder="Escreva a resposta detalhada para o aluno..."
                    className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                  />
                </div>

                {error && <p className="text-base text-red-400">{error}</p>}

                {sending && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                    <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                    <div>
                      <p className="text-sm font-bold text-amber-300">
                        Enviando resposta, aguarde...
                      </p>
                      <p className="mt-0.5 text-xs text-amber-200/70">
                        A resposta será salva e o aluno será notificado.
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
                    {sending ? "Enviando..." : "Enviar resposta"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAnsweringQuestion(null);
                      setAnswerText("");
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

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}
    </section>
  );
}
