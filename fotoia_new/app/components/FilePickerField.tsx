"use client";

import { useEffect, useRef } from "react";

type Props = {
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  hint: string;
  actionLabel?: string;
};

function fileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export default function FilePickerField({ accept, file, onChange, disabled = false, hint, actionLabel = "Escolher arquivo" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!file && inputRef.current) inputRef.current.value = "";
  }, [file]);
  return (
    <div className="rounded-xl border border-dashed border-zinc-600 bg-zinc-950 p-4 transition hover:border-violet-500/60">
      <input ref={inputRef} type="file" accept={accept} disabled={disabled} onChange={(event) => onChange(event.target.files?.[0] ?? null)} className="sr-only" />
      {file ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{file.name}</p>
            <p className="mt-1 text-xs text-zinc-500">{fileSize(file.size)}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="rounded-lg border border-violet-400/30 px-3 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/10 disabled:opacity-50">Trocar</button>
            <button type="button" disabled={disabled} onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = ""; }} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 disabled:opacity-50">Remover</button>
          </div>
        </div>
      ) : (
        <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-2 py-2 text-center disabled:opacity-50">
          <span className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-bold text-zinc-950">{actionLabel}</span>
          <span className="text-xs text-zinc-500">{hint}</span>
        </button>
      )}
    </div>
  );
}
