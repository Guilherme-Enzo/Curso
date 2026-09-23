"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
  action?: boolean;
};

type Props = {
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function SelectField({ value, options, onChange, placeholder = "Selecione uma opção", disabled = false, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, maxHeight: 280 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  const highlightedRef = useRef(0);
  const onChangeRef = useRef(onChange);
  optionsRef.current = options;
  onChangeRef.current = onChange;
  const selected = options.find((option) => option.value === value);

  function updatePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const width = Math.min(Math.max(rect.width, 220), window.innerWidth - margin * 2);
    const left = Math.min(Math.max(rect.left, margin), window.innerWidth - width - margin);
    const below = window.innerHeight - rect.bottom - margin;
    const above = rect.top - margin;
    const desiredHeight = Math.min(320, options.length * 52 + 12);
    const opensAbove = below < Math.min(180, desiredHeight) && above > below;
    const maxHeight = Math.max(140, Math.min(desiredHeight, opensAbove ? above : below));
    setPosition({ left, top: opensAbove ? rect.top - Math.min(desiredHeight, above) - 6 : rect.bottom + 6, width, maxHeight });
  }

  function openList() {
    if (disabled) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
    highlightedRef.current = nextIndex;
    setHighlighted(nextIndex);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setHighlighted((current) => {
          const direction = event.key === "ArrowDown" ? 1 : -1;
          const next = (current + direction + optionsRef.current.length) % optionsRef.current.length;
          highlightedRef.current = next;
          return next;
        });
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const option = optionsRef.current[highlightedRef.current];
        if (option) {
          onChangeRef.current(option.value);
          setOpen(false);
          triggerRef.current?.focus();
        }
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => open ? setOpen(false) : openList()}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left text-base outline-none transition hover:border-violet-500/60 focus:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className={selected ? "text-white" : "text-zinc-500"}>{selected?.label ?? placeholder}</span>
        <span className={`text-xs text-zinc-500 transition ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={listRef}
          role="listbox"
          className="fixed z-[120] overflow-y-auto rounded-xl border border-violet-400/30 bg-zinc-900 p-1.5 shadow-2xl shadow-black/60"
          style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => { highlightedRef.current = index; setHighlighted(index); }}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  option.action
                    ? "text-violet-300 hover:bg-violet-500/10"
                    : isSelected || highlighted === index
                      ? "bg-violet-500/15 text-white"
                      : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && !option.action && <span className="text-cyan-400">✓</span>}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
