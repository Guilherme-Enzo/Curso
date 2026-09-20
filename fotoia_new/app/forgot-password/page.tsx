"use client";

import { useState } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/publicPath";
import SiteFooter from "@/app/components/SiteFooter";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(withBasePath("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível processar a solicitação.");
        return;
      }
      setSent(true);
    } catch {
      setError("Não foi possível processar a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-violet-500/20 bg-white/[0.03] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        {sent ? (
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">O e-mail foi enviado. O link para criar uma nova senha é válido por 30 minutos. Verifique também a caixa de spam.</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <p className="text-sm text-zinc-400">Informe seu e-mail para receber o link de recuperação.</p>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className="w-full rounded-lg border border-violet-400/25 bg-violet-500/[0.08] px-3 py-2 text-white outline-none focus:border-violet-400" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2 font-semibold text-zinc-950 disabled:opacity-50">{loading ? "Enviando..." : "Enviar link"}</button>
          </form>
        )}
        <Link href="/login" className="mt-6 block text-center text-sm text-violet-400 hover:underline">Voltar ao login</Link>
      </div>
      <SiteFooter />
    </main>
  );
}
