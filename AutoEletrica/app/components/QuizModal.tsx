"use client";

import { useEffect, useState } from "react";

type QuizQuestion = {
  id: string;
  question: string;
  order: number;
  options: { id: string; text: string; order: number }[];
};

type QuizDetail = {
  id: string;
  moduleOrder: number;
  title: string;
  questions: QuizQuestion[];
};

type Props = {
  moduleOrder: number;
  moduleName: string;
  onClose: () => void;
};

export default function QuizModal({ moduleOrder, moduleName, onClose }: Props) {
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{
    total: number;
    correct: number;
    results: { questionId: string; correctIndex: number; chosen: number; isCorrect: boolean }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/quizzes?moduleOrder=${moduleOrder}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.quizzes?.length) {
          setError("Nenhuma avaliação disponível para este módulo.");
          return;
        }
        const qId = d.quizzes[0].id;
        return fetch(`/api/quizzes/${qId}`);
      })
      .then((r) => r?.json())
      .then((d) => {
        if (d?.quiz) {
          setQuiz(d.quiz);
          setAnswers(new Array(d.quiz.questions.length).fill(-1));
        }
      })
      .catch(() => setError("Erro ao carregar avaliação"))
      .finally(() => setLoading(false));
  }, [moduleOrder]);

  async function submit() {
    if (!quiz) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Erro ao corrigir avaliação");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-zinc-600 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          ✕
        </button>

        {loading && (
          <div className="flex items-center gap-3 py-10">
            <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-amber-400 border-t-transparent" />
            <p className="text-base text-zinc-400">Carregando avaliação...</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-10 text-center">
            <p className="text-base text-red-400">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5"
            >
              Fechar
            </button>
          </div>
        )}

        {quiz && !loading && !error && (
          <>
            <div className="mb-6 pr-12">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Módulo {String(moduleOrder).padStart(2, "0")}
              </p>
              <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {quiz.questions.length} perguntas
              </p>
            </div>

            {quiz.questions.map((q, qi) => (
              <div
                key={q.id}
                className="mb-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <p className="text-base font-semibold leading-relaxed text-white">
                  {qi + 1}. {q.question}
                </p>
                <div className="mt-3 space-y-2">
                  {q.options.map((op, oi) => {
                    const chosen = answers[qi] === oi;
                    const isCorrect = !!result && result.results[qi]?.correctIndex === oi;
                    const isWrongPick =
                      !!result &&
                      chosen &&
                      result.results[qi]?.isCorrect === false &&
                      oi !== result.results[qi]?.correctIndex;
                    return (
                      <button
                        key={op.id}
                        onClick={() => {
                          if (result) return;
                          const next = [...answers];
                          next[qi] = oi;
                          setAnswers(next);
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                          !result
                            ? chosen
                              ? "border-amber-500 bg-amber-500/10 text-white"
                              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-amber-500/50 hover:text-white"
                            : isCorrect
                            ? "border-emerald-500 bg-emerald-500/10 text-white"
                            : isWrongPick
                            ? "border-red-500/70 bg-red-500/10 text-white"
                            : "border-zinc-700 bg-zinc-900 text-zinc-500"
                        }`}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">
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
                className={`rounded-xl border p-5 text-center ${
                  result.correct >= Math.ceil(result.total / 2)
                    ? "border-emerald-800/50 bg-emerald-950/20"
                    : "border-amber-800/50 bg-amber-950/20"
                }`}
              >
                <p className="text-3xl font-black text-white">
                  {result.correct}/{result.total}
                </p>
                <p className="mt-2 text-base text-zinc-300">
                  {result.correct >= Math.ceil(result.total / 2)
                    ? "Mandou bem!"
                    : "Continue revisando e tente de novo."}
                </p>
              </div>
            ) : (
              <button
                onClick={submit}
                disabled={answers.some((a) => a === -1) || submitting}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-40"
              >
                {submitting ? "Corrigindo..." : "Corrigir avaliação"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
