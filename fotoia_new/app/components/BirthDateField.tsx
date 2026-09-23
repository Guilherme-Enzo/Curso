"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
};

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Selecione a data";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function BirthDateField({ value, onChange, min = "1900-01-01", max = isoDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), disabled = false }: Props) {
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"days" | "years" | "months">("days");
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? new Date().getMonth());
  const [position, setPosition] = useState({ left: 8, top: 8, width: 344, maxHeight: 420 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const minYear = Number(min.slice(0, 4));
  const maxYear = Number(max.slice(0, 4));

  function updatePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const width = Math.min(360, window.innerWidth - margin * 2);
    const left = Math.min(Math.max(rect.left, margin), window.innerWidth - width - margin);
    const below = window.innerHeight - rect.bottom - margin;
    const above = rect.top - margin;
    const maxHeight = Math.min(440, Math.max(300, Math.max(below, above)));
    const opensAbove = below < 360 && above > below;
    setPosition({ left, top: opensAbove ? Math.max(margin, rect.top - maxHeight - 6) : rect.bottom + 6, width, maxHeight });
  }

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index);

  function changeMonth(offset: number) {
    const next = new Date(viewYear, viewMonth + offset, 1);
    if (next.getFullYear() < minYear || next.getFullYear() > maxYear) return;
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          if (!open && selectedDate) {
            setViewYear(selectedDate.getFullYear());
            setViewMonth(selectedDate.getMonth());
          }
          setMode("days");
          setOpen(!open);
        }}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left text-base text-white outline-none transition hover:border-violet-500/60 focus:border-amber-500 disabled:opacity-50"
      >
        <span className={value ? "text-white" : "text-zinc-500"}>{formatDate(value)}</span>
        <span className="text-violet-300">▦</span>
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Escolher data de nascimento"
          className="fixed z-[120] overflow-y-auto rounded-2xl border border-violet-400/30 bg-zinc-900 p-4 shadow-2xl shadow-black/60"
          style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }}
        >
          <div className="flex items-center justify-between gap-2">
            {mode === "days" ? <button type="button" onClick={() => changeMonth(-1)} className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-white/5">‹</button> : <span />}
            <button type="button" onClick={() => setMode(mode === "days" ? "years" : "days")} className="rounded-lg px-3 py-2 font-bold text-white hover:bg-white/5">
              {mode === "days" ? `${months[viewMonth]} de ${viewYear}` : mode === "years" ? "Escolha o ano" : String(viewYear)}
            </button>
            {mode === "days" ? <button type="button" onClick={() => changeMonth(1)} className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-white/5">›</button> : <span />}
          </div>

          {mode === "years" && (
            <div className="mt-3 grid max-h-72 grid-cols-4 gap-2 overflow-y-auto pr-1">
              {years.map((year) => <button key={year} type="button" onClick={() => { setViewYear(year); setMode("months"); }} className={`rounded-lg px-2 py-2 text-sm font-semibold ${year === viewYear ? "bg-violet-500 text-white" : "bg-zinc-950 text-zinc-300 hover:bg-violet-500/15"}`}>{year}</button>)}
            </div>
          )}

          {mode === "months" && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {months.map((month, index) => <button key={month} type="button" onClick={() => { setViewMonth(index); setMode("days"); }} className={`rounded-lg px-2 py-3 text-sm font-semibold ${index === viewMonth ? "bg-violet-500 text-white" : "bg-zinc-950 text-zinc-300 hover:bg-violet-500/15"}`}>{month.slice(0, 3)}</button>)}
            </div>
          )}

          {mode === "days" && (
            <div className="mt-3 grid grid-cols-7 gap-1">
              {weekdays.map((day, index) => <span key={`${day}-${index}`} className="py-2 text-center text-xs font-bold text-zinc-500">{day}</span>)}
              {Array.from({ length: firstDay }, (_, index) => <span key={`empty-${index}`} />)}
              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
                const date = isoDate(viewYear, viewMonth, day);
                const unavailable = date < min || date > max;
                const selected = date === value;
                return <button key={day} type="button" disabled={unavailable} onClick={() => { onChange(date); setOpen(false); triggerRef.current?.focus(); }} className={`aspect-square rounded-lg text-sm font-semibold transition ${selected ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-zinc-950" : "text-zinc-300 hover:bg-violet-500/15"} disabled:cursor-not-allowed disabled:text-zinc-700`}>{day}</button>;
              })}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
