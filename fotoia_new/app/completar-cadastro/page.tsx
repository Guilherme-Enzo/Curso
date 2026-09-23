"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/publicPath";
import SiteFooter from "@/app/components/SiteFooter";
import { genderOptions } from "@/lib/gender";
import SelectField from "@/app/components/SelectField";
import BirthDateField from "@/app/components/BirthDateField";

export default function CompleteRegistrationPage() {
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [birthDateLocked, setBirthDateLocked] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(withBasePath("/api/auth/session"))
      .then((response) => response.json())
      .then((data) => {
        if (!data.user) window.location.href = withBasePath("/login");
        else if (data.user.role === "admin" || (data.user.birthDate && data.user.gender)) window.location.href = withBasePath(data.user.role === "admin" ? "/admin" : data.user.role === "teacher" ? "/professor" : "/aluno");
        else {
          setName(data.user.name);
          setRole(data.user.role);
          setBirthDate(data.user.birthDate ? data.user.birthDate.slice(0, 10) : "");
          setBirthDateLocked(Boolean(data.user.birthDate));
          setGender(data.user.gender || "");
        }
      })
      .catch(() => setError("Não foi possível carregar seu cadastro."));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!birthDate || !gender) {
      setError("Preencha os dados para continuar.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(withBasePath("/api/auth/birth-date"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, gender }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível salvar a data.");
        return;
      }
      window.location.href = withBasePath(role === "admin" ? "/admin" : role === "teacher" ? "/professor" : "/aluno");
    } catch {
      setError("Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-4 text-white">
       <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-violet-500/20 bg-white/[0.03] p-6 shadow-2xl sm:p-8">
         <h1 className="text-2xl font-semibold">Complete seu cadastro</h1>
        <p className="mt-2 text-sm text-zinc-400">Olá, {name || "bem-vindo"}. Informe {birthDateLocked ? "seu gênero" : "seus dados"} para continuar.</p>
        {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        {!birthDateLocked && <label className="mt-6 block text-sm font-semibold text-zinc-200">
           Data de nascimento *
          <div className="mt-2"><BirthDateField value={birthDate} onChange={setBirthDate} /></div>
        </label>}
        <label className="mt-4 block text-sm font-semibold text-zinc-200">
           Gênero *
          <div className="mt-2"><SelectField value={gender} options={genderOptions} onChange={setGender} /></div>
        </label>
         <button type="submit" disabled={saving} className="mt-6 w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2.5 font-medium text-zinc-950 disabled:opacity-50">
          {saving ? "Salvando..." : "Continuar"}
        </button>
      </form>
      <SiteFooter />
    </main>
  );
}
