"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  onClose: () => void;
  autoCloseMs?: number;
};

export default function ErrorModal({ message, onClose, autoCloseMs = 2000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [onClose, autoCloseMs]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-red-700/60 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Erro</h2>
          <button
            onClick={onClose}
            className="text-xl text-zinc-500 transition hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-500/10 p-5">
          <span className="text-2xl">✕</span>
          <div>
            <p className="text-base font-bold text-red-400">{message}</p>
            <p className="mt-1 text-sm text-red-400/70">Tente novamente mais tarde.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
