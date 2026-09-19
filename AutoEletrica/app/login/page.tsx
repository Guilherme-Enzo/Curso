"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          const role = data.user.role;
          if (role === "admin") router.replace("/admin");
          else if (role === "teacher") router.replace("/professor");
          else router.replace("/aluno");
          return;
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao entrar");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050508] p-4">
        <p className="text-zinc-400">Verificando sessão...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#050508]">
      <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <Link href="/" className="flex items-center justify-center gap-2">
          <img src="/icoauto-icon.png" alt="" className="h-9 w-9 rounded-xl shadow-lg shadow-orange-600/30" />
          <span className="text-lg font-bold tracking-tight text-white">
            Auto <span className="text-amber-400">Elétrica</span>
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
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
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
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 py-2 font-semibold text-zinc-950 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-400">
          Não tem conta?{" "}
          <Link href="/register" className="text-amber-400 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
      </div>

      <footer className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/icoauto-icon.png" alt="" className="h-7 w-7 rounded-lg" />
              <span className="text-xs font-bold text-white">
                Auto <span className="text-amber-400">Elétrica</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <Link href="/" className="transition hover:text-white">Voltar ao início</Link>
            </div>
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Auto Elétrica. Elétrica & Injeção Eletrônica Automotiva</p>
          </div>
        </div>
      </footer>
    </main>
  );
}