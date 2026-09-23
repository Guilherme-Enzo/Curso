"use client";

import { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput({ className = "", ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Esconder senha" : "Mostrar senha"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-violet-300"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {visible ? <><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 6a11.5 11.5 0 0 1-3.1 3.9" /><path d="M6.6 6.6C4.4 8 3.2 10 2.5 12c1 2 4.5 6 9.5 6 1 0 2-.2 2.8-.5" /></> : <><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>}
        </svg>
      </button>
    </div>
  );
}
