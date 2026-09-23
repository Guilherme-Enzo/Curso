"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/publicPath";
import SiteFooter from "@/app/components/SiteFooter";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(withBasePath("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível alterar a senha.");
        return;
      }
      setMessage(data.message);
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-white">
       <div className="w-full max-w-md rounded-xl border border-violet-500/20 bg-white/[0.03] p-6 shadow-2xl sm:p-8">
         <h1 className="text-2xl font-semibold">Criar nova senha</h1>
        {message ? <p className="mt-4 text-sm text-emerald-400">{message}</p> : <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-zinc-200">Nova senha *</label><input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nova senha" className="mt-2 w-full rounded-lg border border-zinc-700 bg-white/[0.03] px-3 py-2.5 text-white outline-none focus:border-violet-400" />
            <label className="block text-sm font-semibold text-zinc-200">Confirmar nova senha *</label><input type="password" required minLength={6} value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirme a nova senha" className="mt-2 w-full rounded-lg border border-zinc-700 bg-white/[0.03] px-3 py-2.5 text-white outline-none focus:border-violet-400" />
          {error && <p className="text-sm text-red-400">{error}</p>}
           <button type="submit" disabled={loading || !token} className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2.5 font-medium text-zinc-950 disabled:opacity-50">{loading ? "Salvando..." : "Alterar senha"}</button>
        </form>}
        <Link href="/login" className="mt-6 block text-center text-sm text-violet-400 hover:underline">Voltar ao login</Link>
      </div>
      <SiteFooter />
    </main>
  );
}
