"use client";

type QuestionResult = {
  question: string;
  correctIndex: number;
  chosenIndex: number | null;
  options: { text: string }[];
};

type Props = {
  title: string;
  percentage: number;
  correct: number;
  total: number;
  questions: QuestionResult[];
  onClose: () => void;
};

export default function QuizResultModal({
  title,
  percentage,
  correct,
  total,
  questions,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-zinc-600 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          ✕
        </button>

        <div className="mb-6 pr-12">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {questions.length} perguntas
          </p>
        </div>

        <div
          className={`mb-6 mx-auto max-w-xs rounded-2xl border p-4 text-center ${
            percentage >= 50
              ? "border-emerald-800/50 bg-emerald-950/20"
              : "border-amber-800/50 bg-amber-950/20"
          }`}
        >
          <p className="text-3xl font-black text-white">
            {correct}/{total}
          </p>
          <p className="mt-1 text-base text-zinc-300">
            {percentage >= 50
              ? "Mandou bem!"
              : "Continue revisando e tente de novo."}
          </p>
        </div>

        {questions.map((q, qi) => (
          <div
            key={qi}
            className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <p className="text-base font-semibold leading-relaxed text-white">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((op, oi) => {
                const isCorrect = oi === q.correctIndex;
                const isWrongPick = q.chosenIndex === oi && !isCorrect;
                return (
                  <div
                    key={oi}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : isWrongPick
                        ? "border-red-500/70 bg-red-500/10 text-white"
                        : "border-zinc-700 bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="min-w-0 flex-1">{op.text}</span>
                    {isCorrect && (
                      <span className="shrink-0 text-sm font-bold text-emerald-400">
                        ✓ Correta
                      </span>
                    )}
                    {isWrongPick && (
                      <span className="shrink-0 text-sm font-bold text-red-400">
                        ✗ Sua resposta
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-zinc-700 py-3 text-center text-base font-semibold text-zinc-300 transition hover:bg-white/5"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
