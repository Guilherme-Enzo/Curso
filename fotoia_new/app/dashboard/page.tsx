"use client";

import { useEffect, useRef } from "react";

const BASE = "/fotoia";

export default function DashboardPage() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    async function redirectByRole() {
      try {
        const res = await fetch(BASE + "/api/auth/session");
        if (!res.ok) {
          window.location.href = BASE + "/login";
          return;
        }
        const data = await res.json();
        const role = data?.user?.role;
        if (role === "admin") window.location.href = BASE + "/admin";
        else if (role === "teacher") window.location.href = BASE + "/professor";
        else if (role === "student") window.location.href = BASE + "/aluno";
        else window.location.href = BASE + "/login";
      } catch {
        window.location.href = BASE + "/login";
      }
    }
    redirectByRole();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-400" />
        <p className="text-sm text-zinc-400">Redirecionando...</p>
      </div>
    </main>
  );
}
