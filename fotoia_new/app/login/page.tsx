"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BASE = "/fotoia";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    function checkSession() {
      fetch(BASE + "/api/auth/session")
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            const role = data.user.role;
            if (role === "admin") window.location.href = BASE + "/admin";
            else if (role === "teacher") window.location.href = BASE + "/professor";
            else window.location.href = BASE + "/aluno";
          }
        })
        .catch(() => {});
    }
    checkSession();
    window.addEventListener("pageshow", checkSession);
    return () => window.removeEventListener("pageshow", checkSession);
  }, []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao entrar");
        setLoading(false);
        return;
      }
      const role = data.user.role;
      if (role === "admin") window.location.href = BASE + "/admin";
      else if (role === "teacher") window.location.href = BASE + "/professor";
      else window.location.href = BASE + "/aluno";
    } catch {
      setError("Erro de conexão com o servidor");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0a0a0f]">
      <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-violet-500/20 bg-white/[0.03] backdrop-blur-sm p-8 shadow-2xl">
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-cyan-500 text-lg font-black text-zinc-950 shadow-lg shadow-violet-500/30">
            📸
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Retrato <span className="text-violet-400">ImAginado</span>
          </span>
        </Link>
        <p className="mt-3 text-center text-sm text-zinc-400">Acesse sua conta</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-violet-400/25 bg-violet-500/[0.08] px-3 py-2 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              placeholder="voce@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Senha</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-violet-400/25 bg-violet-500/[0.08] px-3 py-2 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2 font-semibold text-zinc-950 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Não tem conta?{" "}
          <Link href="/register" className="text-violet-400 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
      </div>

      <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
        <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-cyan-500 text-xs font-black text-white">
                📸
              </span>
              <span className="text-xs font-bold text-white">
                Retrato <span className="text-violet-400">ImAginado</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <Link href="/" className="transition hover:text-white">Voltar ao início</Link>
            </div>
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Retrato ImAginado. Prompts de Fotografia e Edição com IA</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
