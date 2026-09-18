"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorModal from "@/app/components/ErrorModal";

type Session = { id: string; name: string; email: string; role: string };

export default function PerfilPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState<"name" | "password" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/fotoia/api/auth/session");
        if (!res.ok) {
          window.location.href = "/fotoia/login";
          return;
        }
        const data = await res.json();
        if (!active) return;
        setSession(data.user);
        setName(data.user.name);
      } catch {
        window.location.href = "/fotoia/login";
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
      const res = await fetch("/fotoia/api/auth/me", {
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
      const res = await fetch("/fotoia/api/auth/me", {
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

  const home = session?.role === "admin" ? "/admin" : session?.role === "teacher" ? "/professor" : "/aluno";

  async function handleLogout() {
    await fetch("/fotoia/api/auth/logout", { method: "POST" });
    window.location.href = "/fotoia/login";
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
                  <header className="relative z-50 border-b border-violet-400/30 bg-violet-500/[0.06] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-cyan-500 text-lg font-black text-zinc-950 shadow-lg shadow-violet-500/30">
                📸
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                Retrato <span className="text-violet-400">ImAginado</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/comunidade"
              className="hidden sm:flex rounded-lg border border-violet-400/50 px-4 py-2 text-base text-violet-300 transition hover:bg-violet-500/[0.12] hover:text-violet-200"
            >
              Comunidade
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
            <div className="relative sm:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg border border-violet-400/40 px-3 py-2 text-lg text-zinc-300 transition hover:bg-violet-500/[0.12]"
              >
                ⋮
              </button>
              {menuOpen && (
                <>
                  <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-violet-400/30 bg-[#0a0a0f] shadow-2xl">
                    <Link href="/comunidade" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-violet-300 hover:bg-violet-500/10 rounded-t-xl">Comunidade</Link>
                    <Link href="/perfil" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-zinc-300 hover:bg-violet-500/10">Perfil</Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl">Sair</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-3 py-8 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Perfil</h1>
        <p className="mt-1 text-base text-zinc-400">
          Altere seu nome e sua senha de acesso.
        </p>

        <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] backdrop-blur-sm p-5">
          <p className="text-sm font-semibold text-zinc-300">E-mail</p>
          <p className="mt-1 text-base font-semibold text-white">{session?.email}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] backdrop-blur-sm p-5">
          <p className="text-sm font-semibold text-zinc-300">Nome</p>
          <p className="mt-1 text-base font-semibold text-white">{session?.name}</p>
        </div>

        <button
          onClick={() => {
            setEditingName(true);
            setMsg(null);
            setModalSuccess(null);
          }}
          className="mt-4 w-full rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] backdrop-blur-sm p-5 text-left transition hover:border-amber-600/50 hover:bg-amber-500/5"
        >
          <span className="text-sm font-semibold text-zinc-300">Nome</span>
          <p className="mt-1 text-base font-bold text-amber-400">Alterar nome</p>
        </button>

        <button
          onClick={() => {
            setEditingPassword(true);
            setMsg(null);
            setModalSuccess(null);
          }}
          className="mt-4 w-full rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] backdrop-blur-sm p-5 text-left transition hover:border-amber-600/50 hover:bg-amber-500/5"
        >
          <span className="text-sm font-semibold text-zinc-300">Senha</span>
          <p className="mt-1 text-base font-bold text-amber-400">Alterar senha</p>
        </button>

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
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
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
                      Nome
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
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
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
                      Senha atual
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
                      Nova senha
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
                      Confirmar nova senha
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
      </div>

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}

      <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-cyan-500 text-xs font-black text-white">
                📸
              </span>
              <span className="text-xs font-bold text-white">
                Retrato <span className="text-violet-400">Imaginado</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <Link href={home} className="transition hover:text-white">Voltar</Link>
              <Link href="/" className="transition hover:text-white">Início</Link>
            </div>
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Retrato ImAginado</p>
          </div>
        </div>
      </footer>
    </main>
  );
}