"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorModal from "@/app/components/ErrorModal";
import { withBasePath } from "@/lib/publicPath";
import SocialIcons from "@/app/components/SocialIcons";
import { genderOptions, getGenderLabel } from "@/lib/gender";
import SelectField from "@/app/components/SelectField";
import BirthDateField from "@/app/components/BirthDateField";

type Session = { id: string; name: string; email: string; birthDate: string | null; gender: string | null; role: string; authProvider: string; plan: "FREE" | "FULL" };

export default function PerfilPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState<"name" | "birthDate" | "gender" | "password" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editingBirthDate, setEditingBirthDate] = useState(false);
  const [editingGender, setEditingGender] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [emailVerifiedNotice, setEmailVerifiedNotice] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  useEffect(() => {
    function handleClickOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("verified") !== "1") return;
    setEmailVerifiedNotice(true);
    const timer = window.setTimeout(() => setEmailVerifiedNotice(false), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(withBasePath("/api/auth/session"));
        if (!res.ok) {
          window.location.href = withBasePath("/login");
          return;
        }
        const data = await res.json();
        if (!active) return;
        setSession(data.user);
        setName(data.user.name);
        setBirthDate(data.user.birthDate ? data.user.birthDate.slice(0, 10) : "");
        setGender(data.user.gender || "");
      } catch {
        window.location.href = withBasePath("/login");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-sm text-zinc-400">
        Carregando...
      </main>
    );
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving("name");
    try {
      const res = await fetch(withBasePath("/api/auth/me"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao salvar nome");
        return;
      }
      setSession((s) => (s ? { ...s, name: data.user.name } : s));
      setModalSuccess("Nome atualizado com sucesso!");
      setTimeout(() => {
        setEditingName(false);
        setModalSuccess(null);
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSaving(null);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPassword !== confirmPassword) {
      setMsg({ ok: false, text: "A confirmação da nova senha não confere." });
      return;
    }
    setSaving("password");
    try {
      const res = await fetch(withBasePath("/api/auth/me"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao trocar a senha");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setModalSuccess("Senha alterada com sucesso!");
      setTimeout(() => {
        setEditingPassword(false);
        setModalSuccess(null);
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSaving(null);
    }
  }

  async function saveBirthDate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving("birthDate");
    try {
      const res = await fetch(withBasePath("/api/auth/birth-date"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao salvar data de nascimento");
        return;
      }
      setSession((s) => (s ? { ...s, birthDate: data.user.birthDate } : s));
      setModalSuccess("Data de nascimento atualizada com sucesso!");
      setTimeout(() => {
        setEditingBirthDate(false);
        setModalSuccess(null);
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSaving(null);
    }
  }

  async function saveGender(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving("gender");
    try {
      const res = await fetch(withBasePath("/api/auth/me"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao salvar gênero");
        return;
      }
      setSession((s) => (s ? { ...s, gender: data.user.gender } : s));
      setModalSuccess("Gênero atualizado com sucesso!");
      setTimeout(() => {
        setEditingGender(false);
        setModalSuccess(null);
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSaving(null);
    }
  }

  function formatBirthDate(value: string | null | undefined) {
    if (!value) return "Não informada";
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  }

  const home = session?.role === "admin" ? "/admin" : session?.role === "teacher" ? "/professor" : "/aluno";

  async function handleLogout() {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    window.location.href = withBasePath("/login");
  }

  async function deleteAccount() {
    if (deleteConfirmation !== "EXCLUIR") return;
    setDeletingAccount(true);
    try {
      const response = await fetch(withBasePath("/api/auth/me"), { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setModalError(data.error || "Não foi possível excluir sua conta.");
        return;
      }
      window.location.href = withBasePath("/login?deleted=1");
    } catch {
      setModalError("Falha de conexão ao excluir sua conta.");
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
                  <header className="relative z-50 border-b border-violet-400/30 bg-violet-500/[0.06] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
               <img src="/icofotoia-icon.png" alt="" className="h-7 w-7 rounded-xl shadow-lg shadow-violet-500/30" />
              <span className="text-lg font-bold tracking-tight text-white">
                Retrato <span className="text-white"><span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">I</span>magin<span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">A</span>do</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={home}
              className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5"
            >
              Voltar
            </Link>
            <Link
              href="/perfil"
              className="hidden sm:flex rounded-lg border border-violet-400/25 px-4 py-2 text-base text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Perfil
            </Link>
         <button
              onClick={handleLogout}
              className="hidden sm:flex rounded-lg border border-red-500/40 px-4 py-2 text-base text-red-400 transition hover:border-red-600 hover:bg-red-500/10 hover:text-red-300"
            >
              Sair
          </button>
            <div ref={menuRef} className="relative sm:hidden">
         <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg border border-violet-400/40 px-3 py-2 text-lg text-zinc-300 transition hover:bg-violet-500/[0.12]"
              >
                ⋮
          </button>
              {menuOpen && (
                <>
                  <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-violet-400/30 bg-[#0a0a0f] shadow-2xl">
                    <Link href="/perfil" onClick={() => setMenuOpen(false)} className="block rounded-t-xl px-4 py-3 text-sm text-zinc-300 hover:bg-violet-500/10">Perfil</Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl">Sair</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-3 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Perfil</h1>
         <p className="mt-1 text-base text-zinc-400">
            {session?.role === "admin" ? "Atualize sua senha de acesso." : "Atualize seus dados pessoais e sua senha de acesso."}
         </p>

         <div className="mt-4 rounded-xl border border-violet-500/20 bg-white/[0.02] p-5">
           <p className="text-sm font-semibold text-zinc-300">E-mail</p>
           <p className="mt-1 text-base font-semibold text-white">{session?.email}</p>
         </div>

          {session?.role !== "admin" && (
            <>
              <div className="mt-4 rounded-xl border border-violet-500/20 bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-300">Nome</p>
                    <p className="mt-1 text-base font-semibold text-white">{session?.name}</p>
                  </div>
                  <button onClick={() => { setEditingName(true); setMsg(null); setModalSuccess(null); }} className="shrink-0 rounded-lg border border-amber-500/40 px-3 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/10">Editar</button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-300">Data de nascimento</p>
                    <p className="mt-1 text-base font-semibold text-white">{formatBirthDate(session?.birthDate)}</p>
                  </div>
                  <button onClick={() => { setEditingBirthDate(true); setMsg(null); setModalSuccess(null); }} className="shrink-0 rounded-lg border border-amber-500/40 px-3 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/10">Editar</button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-violet-500/20 bg-white/[0.02] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-300">Gênero</p>
                    <p className="mt-1 text-base font-semibold text-white">{getGenderLabel(session?.gender)}</p>
                  </div>
                  <button onClick={() => { setGender(session?.gender || ""); setEditingGender(true); setMsg(null); setModalSuccess(null); }} className="shrink-0 rounded-lg border border-amber-500/40 px-3 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/10">Editar</button>
                </div>
              </div>
            </>
          )}

          {session?.authProvider === "password" && <button
          onClick={() => {
            setEditingPassword(true);
            setMsg(null);
            setModalSuccess(null);
          }}
           className="card-interactive mt-4 w-full rounded-xl border border-violet-500/20 bg-white/[0.02] p-5 text-left transition hover:border-violet-400/45 hover:bg-violet-500/[0.04]"
        >
           <span className="text-sm font-semibold text-zinc-300">Senha</span>
           <p className="mt-1 text-base font-bold text-amber-400">Alterar senha</p>
         </button>}

        {editingName && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => {
              if (modalSuccess || saving) return;
              setEditingName(false);
              setName(session?.name || "");
            }}
          >
            <div
               className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-medium text-white">
                  {modalSuccess ? "Sucesso" : "Alterar nome"}
                </h2>
                {!modalSuccess && !saving && (
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setName(session?.name || "");
                    }}
                    className="text-xl text-zinc-500 transition hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {modalSuccess ? (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-500/10 p-5">
                  <span className="text-2xl">✓</span>
                  <p className="text-base font-bold text-emerald-400">
                    {modalSuccess}
                  </p>
                </div>
              ) : (
                <form onSubmit={saveName} className="mt-5 space-y-4">
                  <div>
                     <label className="block text-base font-semibold text-zinc-200">
                       Nome *
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                      disabled={saving === "name"}
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>

                  {msg && !msg.ok && (
                    <p className="text-base text-red-400">{msg.text}</p>
                  )}

                  {saving === "name" && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                      <div>
                        <p className="text-sm font-bold text-amber-300">
                          Salvando seu nome, aguarde...
                        </p>
                        <p className="mt-0.5 text-xs text-amber-200/70">
                          O novo nome será usado em todo o site.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving === "name"}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {saving === "name" ? "Salvando..." : "Salvar nome"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingName(false);
                        setName(session?.name || "");
                      }}
                      className="rounded-xl border border-zinc-700 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        )}

        {editingBirthDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => { if (!modalSuccess && !saving) { setEditingBirthDate(false); setBirthDate(session?.birthDate ? session.birthDate.slice(0, 10) : ""); } }}>
             <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-medium text-white">{modalSuccess ? "Sucesso" : "Alterar data de nascimento"}</h2>
                {!modalSuccess && !saving && <button onClick={() => { setEditingBirthDate(false); setBirthDate(session?.birthDate ? session.birthDate.slice(0, 10) : ""); }} className="text-xl text-zinc-500 transition hover:text-white">✕</button>}
              </div>
              {modalSuccess ? (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-500/10 p-5"><span className="text-2xl">✓</span><p className="text-base font-bold text-emerald-400">{modalSuccess}</p></div>
              ) : (
                <form onSubmit={saveBirthDate} className="mt-5 space-y-4">
                   <div><label className="block text-base font-semibold text-zinc-200">Data de nascimento *</label><div className="mt-2"><BirthDateField value={birthDate} onChange={setBirthDate} disabled={saving === "birthDate"} /></div></div>
                  {msg && !msg.ok && <p className="text-base text-red-400">{msg.text}</p>}
                  {saving === "birthDate" && <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"><span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" /><p className="text-sm font-bold text-amber-300">Salvando, aguarde...</p></div>}
                  <div className="flex flex-wrap gap-3 pt-2"><button type="submit" disabled={saving === "birthDate"} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50">{saving === "birthDate" ? "Salvando..." : "Salvar data"}</button><button type="button" onClick={() => { setEditingBirthDate(false); setBirthDate(session?.birthDate ? session.birthDate.slice(0, 10) : ""); }} className="rounded-xl border border-zinc-700 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5">Cancelar</button></div>
                </form>
              )}
            </div>
          </div>
        )}

        {editingGender && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => { if (!modalSuccess && !saving) { setEditingGender(false); setGender(session?.gender || ""); } }}>
             <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-medium text-white">{modalSuccess ? "Sucesso" : "Alterar gênero"}</h2>
                {!modalSuccess && !saving && <button onClick={() => { setEditingGender(false); setGender(session?.gender || ""); }} className="text-xl text-zinc-500 transition hover:text-white">✕</button>}
              </div>
              {modalSuccess ? (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-500/10 p-5"><span className="text-2xl">✓</span><p className="text-base font-bold text-emerald-400">{modalSuccess}</p></div>
              ) : (
                <form onSubmit={saveGender} className="mt-5 space-y-4">
                  <div>
                     <label className="block text-base font-semibold text-zinc-200">Gênero *</label>
                    <div className="mt-2"><SelectField value={gender} options={genderOptions} onChange={setGender} disabled={saving === "gender"} /></div>
                  </div>
                  {saving === "gender" && <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"><span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" /><p className="text-sm font-bold text-amber-300">Salvando, aguarde...</p></div>}
                  <div className="flex flex-wrap gap-3 pt-2"><button type="submit" disabled={saving === "gender"} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50">{saving === "gender" ? "Salvando..." : "Salvar gênero"}</button><button type="button" onClick={() => { setEditingGender(false); setGender(session?.gender || ""); }} className="rounded-xl border border-zinc-700 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5">Cancelar</button></div>
                </form>
              )}
            </div>
          </div>
        )}

         {editingPassword && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => {
              if (modalSuccess || saving) return;
              setEditingPassword(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            <div
               className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-medium text-white">
                  {modalSuccess ? "Sucesso" : "Alterar senha"}
                </h2>
                {!modalSuccess && !saving && (
                  <button
                    onClick={() => {
                      setEditingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-xl text-zinc-500 transition hover:text-white"
                  >
                    ✕
                  </button>
          )}

        </div>

              {modalSuccess ? (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-500/10 p-5">
                  <span className="text-2xl">✓</span>
                  <p className="text-base font-bold text-emerald-400">
                    {modalSuccess}
                  </p>
                </div>
              ) : (
                <form onSubmit={savePassword} className="mt-5 space-y-4">
                  <div>
                     <label className="block text-base font-semibold text-zinc-200">
                       Senha atual *
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={saving === "password"}
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                     <label className="block text-base font-semibold text-zinc-200">
                       Nova senha *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={saving === "password"}
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                     <label className="block text-base font-semibold text-zinc-200">
                       Confirmar nova senha *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={saving === "password"}
                      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                    />
                  </div>

                  {msg && !msg.ok && (
                    <p className="text-base text-red-400">{msg.text}</p>
                  )}

                  {saving === "password" && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                      <p className="text-sm font-bold text-amber-300">
                        Alterando sua senha, aguarde...
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving === "password"}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {saving === "password" ? "Alterando..." : "Alterar senha"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="rounded-xl border border-zinc-700 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
         )}

        </div>
           </div>
         )}

          {session?.role !== "admin" && <section className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/[0.04] p-5">
           <h2 className="text-base font-semibold text-red-300">Excluir conta</h2>
           <p className="mt-2 text-sm leading-relaxed text-zinc-400">A exclusão é permanente. Seus dados, progresso, dúvidas e participação na comunidade serão apagados e não poderão ser recuperados.</p>
           {session?.plan === "FULL" && <p className="mt-2 text-sm font-semibold leading-relaxed text-amber-300">Como sua conta possui plano FULL, você também perderá o acesso completo e a assinatura associada.</p>}
           <button type="button" onClick={() => { setDeleteConfirmation(""); setDeleteModal(true); }} className="mt-4 rounded-xl border border-red-500/50 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10">Excluir minha conta</button>
          </section>}
       </div>

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => !deletingAccount && setDeleteModal(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-red-500/40 bg-zinc-900 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-400">Ação irreversível</p>
                <h2 className="mt-1 text-xl font-bold text-white">Excluir sua conta?</h2>
              </div>
              <button type="button" onClick={() => setDeleteModal(false)} disabled={deletingAccount} className="text-xl text-zinc-500 hover:text-white">✕</button>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-zinc-300">Todos os seus dados serão excluídos permanentemente. Essa ação não pode ser desfeita nem recuperada.</p>
            {session?.plan === "FULL" && <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold leading-relaxed text-amber-200">Seu plano FULL e a assinatura associada também serão perdidos com a exclusão.</p>}
            <label className="mt-5 block text-sm font-semibold text-zinc-200">Digite <span className="text-red-300">EXCLUIR</span> para confirmar</label>
            <input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} disabled={deletingAccount} className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-400" autoComplete="off" />
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={deleteAccount} disabled={deletingAccount || deleteConfirmation !== "EXCLUIR"} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40">{deletingAccount ? "Excluindo..." : "Excluir permanentemente"}</button>
              <button type="button" onClick={() => setDeleteModal(false)} disabled={deletingAccount} className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/5">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {emailVerifiedNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
           <div className="w-full max-w-md rounded-xl border border-emerald-400/30 bg-zinc-900 p-5 text-center shadow-2xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-400/15 text-2xl text-emerald-300">✓</div>
             <h2 className="mt-4 text-lg font-medium text-emerald-300">E-mail confirmado!</h2>
            <p className="mt-2 text-base text-zinc-300">Sua conta foi ativada e você já está logado.</p>
          </div>
        </div>
      )}

      <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
               <img src="/icofotoia-icon.png" alt="" className="h-5 w-5 rounded-lg" />
              <span className="text-xs font-bold text-white">
                Retrato <span className="text-white"><span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">I</span>magin<span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">A</span>do</span>
               </span>
             </div>
               <p className="whitespace-nowrap text-[11px] text-zinc-500 sm:text-sm">Plataforma educacional de prompts de fotografia e edição com IA.</p>
              <SocialIcons />
           </div>
        </div>
      </footer>
    </main>
  );
}
