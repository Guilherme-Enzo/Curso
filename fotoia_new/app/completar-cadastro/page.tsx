"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/publicPath";
import SiteFooter from "@/app/components/SiteFooter";

export default function CompleteRegistrationPage() {
  const [birthDate, setBirthDate] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(withBasePath("/api/auth/session"))
      .then((response) => response.json())
      .then((data) => {
        if (!data.user) window.location.href = withBasePath("/login");
        else if (data.user.birthDate) window.location.href = withBasePath("/aluno");
        else setName(data.user.name);
      })
      .catch(() => setError("Não foi possível carregar seu cadastro."));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch(withBasePath("/api/auth/birth-date"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível salvar a data.");
        return;
      }
      window.location.href = withBasePath("/aluno");
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-violet-500/20 bg-white/[0.03] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">Complete seu cadastro</h1>
        <p className="mt-2 text-sm text-zinc-400">Olá, {name || "bem-vindo"}. Informe sua data de nascimento para continuar.</p>
        {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        <label className="mt-6 block text-sm text-zinc-300">
          Data de nascimento
          <input type="date" required value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="mt-2 w-full rounded-lg border border-violet-400/25 bg-violet-500/[0.08] px-3 py-2 text-white outline-none focus:border-violet-400" />
        </label>
        <button type="submit" disabled={saving} className="mt-6 w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2 font-semibold text-zinc-950 disabled:opacity-50">
          {saving ? "Salvando..." : "Continuar"}
        </button>
      </form>
      <SiteFooter />
    </main>
  );
}
