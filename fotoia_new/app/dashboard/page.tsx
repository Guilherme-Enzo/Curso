"use client";

import { useEffect, useRef } from "react";
import { withBasePath } from "@/lib/publicPath";
import SiteFooter from "@/app/components/SiteFooter";

export default function DashboardPage() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    async function redirectByRole() {
      try {
        const res = await fetch(withBasePath("/api/auth/session"));
        if (!res.ok) {
          window.location.href = withBasePath("/login");
          return;
        }
        const data = await res.json();
        const role = data?.user?.role;
        if (role === "admin") window.location.href = withBasePath("/admin");
        else if (role === "teacher") window.location.href = withBasePath("/professor");
        else if (role === "student") window.location.href = withBasePath("/aluno");
        else window.location.href = withBasePath("/login");
      } catch {
        window.location.href = withBasePath("/login");
      }
    }
    redirectByRole();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-400" />
        <p className="text-sm text-zinc-400">Redirecionando...</p>
      </div>
      <SiteFooter />
    </main>
  );
}
