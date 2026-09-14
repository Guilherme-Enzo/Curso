"use client";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-3 text-base text-zinc-400">{message}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onConfirm}
            className={`rounded-xl px-6 py-3 text-base font-bold transition hover:-translate-y-0.5 ${
              danger
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600"
                : "bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="rounded-xl border border-zinc-700 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
