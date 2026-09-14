"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectByRole() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        const role = data?.user?.role;
        if (role === "admin") router.replace("/admin");
        else if (role === "teacher") router.replace("/professor");
        else if (role === "student") router.replace("/aluno");
        else router.replace("/login");
      } catch {
        router.replace("/login");
      }
    }
    redirectByRole();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-400" />
        <p className="text-sm text-zinc-400">Redirecionando...</p>
      </div>
    </main>
  );
}