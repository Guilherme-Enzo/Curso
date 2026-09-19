"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/publicPath";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", birthDate: "", password: "" });

  useEffect(() => {
    function checkSession() {
      fetch(withBasePath("/api/auth/session"))
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            if (!data.user.birthDate) window.location.href = withBasePath("/completar-cadastro");
            const role = data.user.role;
            if (role === "admin") window.location.href = withBasePath("/admin");
            else if (role === "teacher") window.location.href = withBasePath("/professor");
            else window.location.href = withBasePath("/aluno");
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
      const res = await fetch(withBasePath("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar");
        setLoading(false);
        return;
      }
      const role = data.user.role;
      if (!data.user.birthDate) {
        window.location.href = withBasePath("/completar-cadastro");
        return;
      }
      else if (role === "admin") window.location.href = withBasePath("/admin");
      else if (role === "teacher") window.location.href = withBasePath("/professor");
      else window.location.href = withBasePath("/aluno");
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
          <img src="/icofotoia-icon.png" alt="" className="h-9 w-9 rounded-xl shadow-lg shadow-violet-500/30" />
          <span className="text-lg font-bold tracking-tight text-white">
            Retrato <span className="text-white"><span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">I</span>magin<span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">A</span>do</span>
          </span>
        </Link>
        <p className="mt-3 text-center text-sm text-zinc-400">Crie sua conta para começar</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Nome</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-violet-400/25 bg-violet-500/[0.08] px-3 py-2 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              placeholder="Seu nome"
            />
          </div>

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
            <label className="text-sm text-zinc-300">Data de nascimento</label>
            <input
              type="date"
              required
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-violet-400/25 bg-violet-500/[0.08] px-3 py-2 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-violet-400/25 bg-violet-500/[0.08] px-3 py-2 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2 font-semibold text-zinc-950 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
          <span className="h-px flex-1 bg-zinc-800" />
          ou
          <span className="h-px flex-1 bg-zinc-800" />
        </div>
        <a
          href="/api/auth/google"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-white px-4 py-2 font-semibold text-zinc-800 transition hover:bg-zinc-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.35 12.27c0-.68-.06-1.34-.18-1.97H12v3.73h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.7 2.92-4.2 2.92-7.13Z" />
            <path fill="#34A853" d="M12 21.72c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0 0 12 21.72Z" />
            <path fill="#FBBC05" d="M6.53 13.81a5.85 5.85 0 0 1 0-3.62V7.67H3.28a9.73 9.73 0 0 0 0 8.66l3.25-2.52Z" />
            <path fill="#EA4335" d="M12 6.16c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.25 14.63 2.28 12 2.28a9.74 9.74 0 0 0-8.72 5.39l3.25 2.52C7.3 7.88 9.46 6.16 12 6.16Z" />
          </svg>
          Cadastrar com Google
        </a>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Já tem conta?{" "}
          <Link href="/login" className="text-violet-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
      </div>

      <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
        <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/icofotoia-icon.png" alt="" className="h-7 w-7 rounded-lg" />
              <span className="text-xs font-bold text-white">
                Retrato <span className="text-white"><span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">I</span>magin<span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">A</span>do</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <Link href="/" className="transition hover:text-white">Voltar ao início</Link>
            </div>
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Retrato ImaginAdo. Prompts de Fotografia e Edição com IA</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
