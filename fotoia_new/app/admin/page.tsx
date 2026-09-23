"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModulesManager from "@/app/components/ModulesManager";
import QuestionsManager from "@/app/components/QuestionsManager";
import ConfirmModal from "@/app/components/ConfirmModal";
import ErrorModal from "@/app/components/ErrorModal";
import ComunidadeTab from "@/app/components/ComunidadeTab";
import { withBasePath } from "@/lib/publicPath";
import SocialIcons from "@/app/components/SocialIcons";
import Icon, { type IconName } from "@/app/components/Icon";
import PromptsManager from "@/app/components/PromptsManager";
import PasswordInput from "@/app/components/PasswordInput";
import SelectField from "@/app/components/SelectField";
import { restoreModuleScroll, takeModuleReturn } from "@/lib/moduleNavigation";

type Session = { userId: string; role: string; name: string };

type Stats = {
  students: number;
  fullStudents: number;
  teachers: number;
  modules: number;
  prompts: number;
  openQuestions: number;
  answeredQuestions: number;
  ageDistribution: number[];
  genderDistribution: {
    male: number;
    female: number;
    other: number;
    prefer_not_to_say: number;
    not_informed: number;
  };
};

type Teacher = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type Student = Teacher & { birthDate: string | null; plan: "FREE" | "FULL" };

type Tab = "dashboard" | "conteudo" | "duvidas" | "professores" | "alunos" | "comunidade" | "prompts";

function calculateAge(birthDate: string | null) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const birthdayNotReached = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (birthdayNotReached) age -= 1;
  return age >= 0 ? age : null;
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [unreadQuestions, setUnreadQuestions] = useState(0);
  const [unreadCommunity, setUnreadCommunity] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  
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
    async function load() {
      try {
        const res = await fetch(withBasePath("/api/auth/session"));
        if (!res.ok) {
          window.location.href = withBasePath("/login");
          return;
        }
        const data = await res.json();
        if (data?.user?.role !== "admin") {
          window.location.href = data?.user?.role === "teacher" ? withBasePath("/professor") : withBasePath("/aluno");
          return;
        }
        setSession({ ...data.user, userId: data.user.id });
      } catch {
        window.location.href = withBasePath("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    async function loadNotificationCounts() {
      const [questionsRes, topicsRes] = await Promise.all([
        fetch(withBasePath("/api/questions")),
        fetch(withBasePath("/api/topics")),
      ]);
      if (!active) return;
      if (questionsRes.ok) {
        const data = await questionsRes.json();
        setUnreadQuestions(data.questions.filter((question: { status: string }) => question.status === "open").length);
      }
      if (topicsRes.ok) {
        const data = await topicsRes.json();
        setUnreadCommunity(data.topics.reduce((total: number, topic: { unreadCount: number }) => total + topic.unreadCount, 0));
      }
    }
    void loadNotificationCounts();
    const timer = window.setInterval(loadNotificationCounts, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, [session]);

  useEffect(() => {
    const scrollY = takeModuleReturn("/admin");
    if (scrollY !== null) restoreModuleScroll(scrollY);
  }, []);

  async function handleLogout() {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    window.location.href = withBasePath("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050508] text-sm text-zinc-400">
        Carregando...
      </main>
    );
  }

  const tabs: { key: Tab; label: string; icon: IconName; href?: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "chart" },
    { key: "conteudo", label: "Conteúdo", icon: "book" },
    { key: "prompts", label: "Prompts", icon: "spark" },
    { key: "duvidas", label: "Canal de Dúvidas", icon: "message" },
    { key: "comunidade", label: "Comunidade", icon: "users" },
     { key: "professores", label: "Colaboradores", icon: "users" },
    { key: "alunos", label: "Usuários", icon: "users" },
  ];

  return (
    <main className="min-h-screen bg-[#050508] text-white">
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
                    <Link href="/perfil" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm text-zinc-300 hover:bg-violet-500/10 rounded-t-xl">Perfil</Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl">Sair</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b border-violet-400/30 bg-[#0a0a0f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-3 py-3 sm:px-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => t.href ? window.location.href = t.href : setTab(t.key)}
              className={`flex min-w-max items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                tab === t.key && !t.href
                  ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-zinc-950"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
              {t.key === "duvidas" && unreadQuestions > 0 && <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{unreadQuestions}</span>}
              {t.key === "comunidade" && unreadCommunity > 0 && <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{unreadCommunity}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Painel do Administrador
        </h1>
        <p className="mt-1 text-base text-zinc-400">
          {tab === "dashboard"
            ? "Acompanhe os indicadores e a atividade da plataforma."
            : tab === "conteudo"
              ? "Crie, organize e revise o conteúdo disponibilizado aos usuários."
              : tab === "duvidas"
                  ? "Responda às dúvidas dos usuários sobre estudos, plataforma, pagamentos e questões técnicas."
                  : tab === "comunidade"
                    ? "Acompanhe e modere a comunidade."
                    : tab === "prompts"
                      ? "Crie e organize prompts para edição e criação de imagens."
                    : tab === "professores"
                       ? "Gerencie os colaboradores e seus acessos."
                      : "Gerencie os usuários e seus planos de acesso."}
        </p>

        {tab === "dashboard" && <Dashboard />}
        {tab === "conteudo" && <ModulesManager viewer="admin" />}
        {tab === "duvidas" && <QuestionsManager onOpenCountChange={setUnreadQuestions} />}
        {tab === "comunidade" && <ComunidadeTab session={session!} onUnreadCountChange={setUnreadCommunity} />}
        {tab === "professores" && <TeachersManager />}
        {tab === "alunos" && <StudentsManager />}
        {tab === "prompts" && <PromptsManager />}
      </div>

      <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
         <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
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

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [activeAge, setActiveAge] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(withBasePath("/api/admin/stats"));
        if (!res.ok) {
          setError("Erro ao carregar estatísticas");
          return;
        }
        const data = await res.json();
        setStats(data.stats);
      } catch {
        setError("Falha de conexão");
      }
    }
    load();
  }, []);

  if (error) {
    return <p className="mt-6 text-base text-red-400">{error}</p>;
  }
  if (!stats) {
    return <p className="mt-6 text-base text-zinc-500">Carregando estatísticas...</p>;
  }

  const cards = [
    { label: "Usuários", value: stats.students, icon: "users" as IconName },
     { label: "Usuários FULL", value: stats.fullStudents, icon: "users" as IconName },
    { label: "Colaboradores", value: stats.teachers, icon: "book" as IconName },
    { label: "Prompts", value: stats.prompts, icon: "spark" as IconName },
    { label: "Dúvidas abertas", value: stats.openQuestions, icon: "message" as IconName },
    { label: "Dúvidas respondidas", value: stats.answeredQuestions, icon: "check" as IconName },
  ];

  const freeStudents = Math.max(stats.students - stats.fullStudents, 0);
  const studentTotal = stats.students || 1;
  const fullPercent = (stats.fullStudents / studentTotal) * 100;
  const freePercent = (freeStudents / studentTotal) * 100;
  const genderSegments = [
    { label: "Masculino", value: stats.genderDistribution.male, color: "#3b82f6" },
    { label: "Feminino", value: stats.genderDistribution.female, color: "#ec4899" },
    { label: "Outro", value: stats.genderDistribution.other, color: "#a855f7" },
    { label: "Prefiro não informar", value: stats.genderDistribution.prefer_not_to_say, color: "#f59e0b" },
    { label: "Não informado", value: stats.genderDistribution.not_informed, color: "#71717a" },
  ].filter((segment) => segment.value > 0);
  const genderTotal = genderSegments.reduce((total, segment) => total + segment.value, 0);
  let genderProgress = 0;
  const genderGradient = genderTotal > 0
    ? `conic-gradient(${genderSegments.map((segment) => { const start = genderProgress; genderProgress += (segment.value / genderTotal) * 100; return `${segment.color} ${start}% ${genderProgress}%`; }).join(", ")})`
    : "#3f3f46";
  const lastAgeWithUsers = stats.ageDistribution.reduce(
    (lastAge, count, age) => (count > 0 ? age : lastAge),
    0,
  );
  const chartMaxAge = lastAgeWithUsers + 5;
  const ageDistribution = Array.from(
    { length: chartMaxAge + 1 },
    (_, age) => stats.ageDistribution[age] ?? 0,
  );
  const maxAgeCount = Math.max(...ageDistribution, 1);
  const chartWidth = 505;
  const chartHeight = 280;
  const chartPoints = ageDistribution.map((count, age) => ({
    x: (age / chartMaxAge) * chartWidth,
    y: chartHeight - (count / maxAgeCount) * 230 - 20,
  }));
  const curvePath = chartPoints.reduce((path, point, index, points) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const controlOffset = (point.x - previous.x) / 2;
    return `${path} C ${previous.x + controlOffset} ${previous.y}, ${point.x - controlOffset} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const areaPath = `${curvePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  const activePoint = activeAge === null ? null : chartPoints[activeAge];
  const tooltipX = activePoint ? Math.min(Math.max(activePoint.x - 60, 2), chartWidth - 122) : 0;
  const tooltipY = activePoint ? Math.max(activePoint.y - 58, 4) : 0;

  return (
    <section className="mt-6">
       <h2 className="text-lg font-medium text-white">Visão geral</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{c.label}</p>
              <Icon name={c.icon} size={19} className="text-violet-300" />
            </div>
             <p className="mt-2 text-3xl font-semibold text-white">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
             <h3 className="text-base font-medium text-white">Usuários FULL x FREE</h3>
            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0 rounded-full" style={{ background: stats.students > 0 ? `conic-gradient(#22c55e 0 ${fullPercent}%, #ef4444 ${fullPercent}% 100%)` : "#3f3f46" }} role="img" aria-label={`${stats.fullStudents} usuários FULL e ${freeStudents} usuários FREE`}>
                <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-zinc-900">
                  <span className="text-3xl font-black text-white">{stats.students}</span>
                  <span className="text-xs text-zinc-500">usuários</span>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-green-500" /><span className="text-zinc-300">FULL: <strong className="text-white">{stats.fullStudents}</strong> ({fullPercent.toFixed(1)}%)</span></div>
                <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-red-500" /><span className="text-zinc-300">FREE: <strong className="text-white">{freeStudents}</strong> ({freePercent.toFixed(1)}%)</span></div>
              </div>
            </div>
          </div>
          <div>
             <h3 className="text-base font-medium text-white">Usuários por gênero</h3>
            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0 rounded-full" style={{ background: genderGradient }} role="img" aria-label="Distribuição dos usuários por gênero">
                <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-zinc-900">
                  <span className="text-3xl font-black text-white">{genderTotal}</span>
                  <span className="text-xs text-zinc-500">usuários</span>
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                {genderSegments.map((segment) => <div key={segment.label} className="flex items-center gap-3"><span className="h-3 w-3 shrink-0 rounded-full" style={{ background: segment.color }} /><span className="text-zinc-300">{segment.label}: <strong className="text-white">{segment.value}</strong> ({((segment.value / (genderTotal || 1)) * 100).toFixed(1)}%)</span></div>)}
                {genderSegments.length === 0 && <span className="text-zinc-500">Nenhum usuário cadastrado.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white">Usuários por idade</h3>
            <p className="mt-1 text-sm text-zinc-500">Quantidade de usuários cadastrados por ano de idade</p>
          </div>
          <span className="text-xs text-zinc-500">0 a {chartMaxAge} anos</span>
        </div>
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="relative w-full">
            <div className="absolute left-0 top-0 z-10 flex h-5 items-center rounded bg-zinc-950/80 px-2 text-[10px] text-zinc-400">
              Máximo: {maxAgeCount} usuário{maxAgeCount === 1 ? "" : "s"}
            </div>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + 32}`}
              preserveAspectRatio="none"
              className="h-64 w-full overflow-visible sm:h-72"
              role="img"
              aria-label="Distribuição de usuários por idade"
              onClick={() => setActiveAge(null)}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") setActiveAge(null);
              }}
            >
              <defs>
                <linearGradient id="age-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <line x1="0" y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} stroke="#3f3f46" />
              <line x1="0" y1={chartHeight - 135} x2={chartWidth} y2={chartHeight - 135} stroke="#27272a" strokeDasharray="3 6" />
              <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#27272a" strokeDasharray="3 6" />
              {chartPoints.map((point, age) => (
                <g key={age}>
                  <line x1={point.x} y1={age % 5 === 0 ? 20 : chartHeight - 28} x2={point.x} y2={chartHeight - 20} stroke="#27272a" strokeOpacity={age % 5 === 0 ? "0.45" : "0.18"} />
                  {age % 5 === 0 ? (
                    <text x={point.x} y={chartHeight + 16} textAnchor="middle" fill="#71717a" fontSize="10">{age}</text>
                  ) : null}
                </g>
              ))}
              <path d={areaPath} fill="url(#age-area)" />
              <path d={curvePath} fill="none" stroke="#22d3ee" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              {chartPoints.map((point, age) => (
                <circle
                  key={`hit-${age}`}
                  cx={point.x}
                  cy={point.y}
                  r="9"
                  fill="transparent"
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setActiveAge(age);
                  }}
                  onPointerDown={() => setActiveAge(age)}
                  onClick={(event) => event.stopPropagation()}
                />
              ))}
              {chartPoints.map((point, age) => (
                  ageDistribution[age] > 0 ? (
                  <circle key={`point-${age}`} cx={point.x} cy={point.y} r="3" fill="#22d3ee" stroke="#0f172a" strokeWidth="2">
                    <title>{`${age} anos: ${ageDistribution[age]} usuário${ageDistribution[age] === 1 ? "" : "s"}`}</title>
                  </circle>
                ) : null
              ))}
              {activePoint && activeAge !== null ? (
                <g pointerEvents="none" transform={`translate(${tooltipX} ${tooltipY})`}>
                  <rect width="120" height="46" rx="8" fill="#09090b" stroke="#52525b" />
                  <text x="8" y="18" fill="#e4e4e7" fontSize="11">Idade: {activeAge} anos</text>
                  <text x="8" y="35" fill="#22d3ee" fontSize="11">Usuários: {ageDistribution[activeAge]}</text>
                </g>
              ) : null}
              <text x="6" y="16" fill="#71717a" fontSize="10">{maxAgeCount}</text>
              <text x="6" y={chartHeight - 24} fill="#71717a" fontSize="10">0</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeachersManager() {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Teacher | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  async function load() {
    try {
      const res = await fetch(withBasePath("/api/admin/teachers"));
      if (!res.ok) {
        setModalError("Erro ao carregar colaboradores");
        return;
      }
      const data = await res.json();
      setTeachers(data.teachers);
    } catch {
      setModalError("Falha de conexão");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const res = await fetch(withBasePath("/api/admin/teachers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao cadastrar colaborador");
        return;
      }
      setModalSuccess(`Colaborador ${data.teacher.name} cadastrado com sucesso!`);
      load();
      setTimeout(() => {
        setCreating(false);
        setModalSuccess(null);
        setName("");
        setEmail("");
        setPassword("");
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  async function handleRemove(id: string, teacherName: string) {
    setError("");
    setSuccess("");
    setDeletingId(id);
    try {
      const res = await fetch(withBasePath(`/api/admin/teachers/${id}`), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setModalError(data.error || "Erro ao excluir colaborador");
        return;
      }
      setDeleteSuccess(`Colaborador ${teacherName} excluído com sucesso!`);
      load();
      setTimeout(() => setDeleteSuccess(null), 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-6 space-y-8">
      <button
        onClick={() => {
          setCreating(true);
          setError("");
          setSuccess("");
          setModalSuccess(null);
          setName("");
          setEmail("");
           setPassword("");
        }}
         className="w-full rounded-lg border border-violet-400/30 bg-white/[0.025] px-4 py-3 text-sm font-medium text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/[0.08] sm:w-auto"
      >
              ＋ Cadastrar colaborador
      </button>

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
             if (modalSuccess || sending) return;
             setCreating(false);
             setName("");
             setEmail("");
             setPassword("");
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                 {modalSuccess ? "Sucesso" : "Cadastrar colaborador"}
              </h2>
              {!modalSuccess && !sending && (
                <button
                   onClick={() => {
                     setCreating(false);
                     setName("");
                     setEmail("");
                     setPassword("");
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
            <form onSubmit={handleAdd} className="mt-5 space-y-4">
              <div>
                <label className="block text-base font-semibold text-zinc-200">
                    Nome completo *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={sending}
                  placeholder="Ex.: Prof. Carlos"
                   className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                 />
               </div>

               <div>
                 <label className="block text-base font-semibold text-zinc-200">
                    E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={sending}
                  placeholder="prof@auto.com"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-zinc-200">
                   Senha *
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={sending}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              {error && <p className="text-base text-red-400">{error}</p>}

              {sending && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                  <div>
                    <p className="text-sm font-bold text-amber-300">
                      Cadastrando colaborador, aguarde...
                    </p>
                    <p className="mt-0.5 text-xs text-amber-200/70">
                      O acesso do colaborador está sendo criado e aparecerá na lista abaixo.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                    {sending ? "Cadastrando..." : "Cadastrar colaborador"}
                </button>
                <button
                  type="button"
                   onClick={() => {
                     setCreating(false);
                     setName("");
                     setEmail("");
                     setPassword("");
                   }}
                  className="rounded-xl border border-violet-400/25 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white">
          Colaboradores cadastrados{" "}
          <span className="ml-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-violet-300">
            {teachers?.length ?? "..."}
          </span>
        </h2>
        {!teachers ? (
          <p className="mt-3 text-base text-zinc-500">Carregando...</p>
        ) : teachers.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
            Nenhum colaborador cadastrado ainda.
          </p>
        ) : (
           <div className="mt-3 grid gap-3 md:grid-cols-2">
            {teachers.map((t) => (
              <article
                key={t.id}
                 className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{t.email}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Cadastrado em {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(t)}
                  disabled={deletingId === t.id}
                  className="shrink-0 rounded-lg border border-red-800/60 px-4 py-2 text-base font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-80"
                >
                  {deletingId === t.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      Excluindo...
                    </span>
                  ) : (
                    "Excluir"
                  )}
                </button>
              </article>
            ))}
            {deletingId && (
              <div className="flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-500/10 p-4">
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                <p className="text-sm font-bold text-red-300">
                  Excluindo colaborador, aguarde...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Excluir colaborador"
          message={`Excluir o colaborador ${confirmDelete.name}? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            handleRemove(confirmDelete.id, confirmDelete.name);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {deleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <p className="text-base font-bold text-emerald-400">
                {deleteSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}
    </section>
  );
}

function StudentsManager() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPlan, setNewPlan] = useState<"FREE" | "FULL" | "">("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Teacher | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [planChange, setPlanChange] = useState<{ student: Student; plan: "FREE" | "FULL" | "" } | null>(null);
  const fullStudents = students?.filter((student) => student.plan === "FULL") ?? [];
  const freeStudents = students?.filter((student) => student.plan === "FREE") ?? [];

  async function load() {
    try {
      const res = await fetch(withBasePath("/api/admin/students"));
      if (!res.ok) {
        setModalError("Erro ao carregar usuários");
        return;
      }
      const data = await res.json();
      setStudents(data.students);
    } catch {
      setModalError("Falha de conexão");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlan) {
      setModalError("O campo Plano não pode ficar em branco.");
      return;
    }
    setError("");
    setSuccess("");
    setSending(true);
    try {
      const res = await fetch(withBasePath("/api/admin/students"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, plan: newPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
      setModalError(data.error || "Erro ao cadastrar usuário");
        return;
      }
      setModalSuccess(`Usuário ${data.student.name} cadastrado com sucesso!`);
      load();
      setTimeout(() => {
        setCreating(false);
        setModalSuccess(null);
        setName("");
        setEmail("");
        setPassword("");
           setNewPlan("");
      }, 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setSending(false);
    }
  }

  async function handleRemove(id: string, studentName: string) {
    setError("");
    setSuccess("");
    setDeletingId(id);
    try {
      const res = await fetch(withBasePath(`/api/admin/students/${id}`), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
      setModalError(data.error || "Erro ao excluir usuário");
        return;
      }
      setDeleteSuccess(`Usuário ${studentName} excluído com sucesso!`);
      load();
      setTimeout(() => setDeleteSuccess(null), 2000);
    } catch {
      setModalError("Falha de conexão");
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePlanChange(id: string, plan: "FREE" | "FULL") {
    setUpdatingPlanId(id);
    try {
      const res = await fetch(withBasePath(`/api/admin/students/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setModalError(data.error || "Erro ao atualizar plano");
        return false;
      }
      await load();
      return true;
    } catch {
      setModalError("Falha de conexão");
      return false;
    } finally {
      setUpdatingPlanId(null);
    }
  }

  async function confirmPlanChange() {
    if (!planChange || !planChange.plan) {
      setModalError("O campo Novo plano não pode ficar em branco.");
      return;
    }
    const changed = await handlePlanChange(planChange.student.id, planChange.plan);
    if (changed) setPlanChange(null);
  }

  return (
    <section className="mt-6 space-y-8">
      <button
        onClick={() => {
          setCreating(true);
          setError("");
          setSuccess("");
          setModalSuccess(null);
          setName("");
          setEmail("");
          setPassword("");
          setNewPlan("");
        }}
         className="w-full rounded-lg border border-violet-400/30 bg-white/[0.025] px-4 py-3 text-sm font-medium text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/[0.08] sm:w-auto"
      >
              ＋ Cadastrar usuário
      </button>

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (modalSuccess || sending) return;
            setCreating(false);
            setName("");
            setEmail("");
            setPassword("");
         setNewPlan("");
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                 {modalSuccess ? "Sucesso" : "Cadastrar usuário"}
              </h2>
              {!modalSuccess && !sending && (
                <button
                  onClick={() => {
                    setCreating(false);
                    setName("");
                     setEmail("");
                     setPassword("");
                     setNewPlan("");
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
            <form onSubmit={handleAdd} className="mt-5 space-y-4">
              <div>
                <label className="block text-base font-semibold text-zinc-200">
                    Nome completo *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={sending}
                   placeholder="Ex.: João Silva"
                   className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                 />
               </div>

                <div>
                  <label className="block text-base font-semibold text-zinc-200">Plano *</label>
                   <div className="mt-2"><SelectField value={newPlan} onChange={(value) => setNewPlan(value as "FREE" | "FULL")} disabled={sending} options={[{ value: "FREE", label: "FREE" }, { value: "FULL", label: "FULL" }]} className="font-bold" /></div>
               </div>

               <div>
                <label className="block text-base font-semibold text-zinc-200">
                   E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={sending}
                      placeholder="usuario@email.com"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-zinc-200">
                   Senha *
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={sending}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-2 w-full rounded-xl border border-violet-400/25 bg-zinc-950 px-4 py-3 text-base text-white outline-none transition focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              {error && <p className="text-base text-red-400">{error}</p>}

              {sending && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                  <div>
                    <p className="text-sm font-bold text-amber-300">
                        Cadastrando usuário, aguarde...
                    </p>
                    <p className="mt-0.5 text-xs text-amber-200/70">
                        O acesso do usuário está sendo criado e aparecerá na lista abaixo.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-base font-bold text-zinc-950 transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                    {sending ? "Cadastrando..." : "Cadastrar usuário"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setName("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="rounded-xl border border-violet-400/25 px-6 py-3 text-base font-semibold text-zinc-300 transition hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white">
          Usuários cadastrados{" "}
          <span className="ml-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-violet-300">
            {students?.length ?? "..."}
          </span>
        </h2>
        {!students ? (
          <p className="mt-3 text-base text-zinc-500">Carregando...</p>
        ) : students.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
            Nenhum usuário cadastrado ainda.
          </p>
        ) : (
          <div className="mt-5 space-y-8">
            {[
              { label: "Plano FULL", students: fullStudents, color: "text-emerald-300", badge: "bg-emerald-500/10" },
              { label: "Plano FREE", students: freeStudents, color: "text-violet-300", badge: "bg-violet-500/10" },
            ].map((group) => (
              <div key={group.label}>
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  {group.label}
                  <span className={`rounded-full px-3 py-1 text-sm ${group.color} ${group.badge}`}>
                    {group.students.length}
                  </span>
                </h3>
                {group.students.length === 0 ? (
                  <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-base text-zinc-500">
                    Nenhum usuário neste plano.
                  </p>
                ) : (
                   <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {group.students.map((s) => (
                      <article
                        key={s.id}
                         className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{s.name}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${group.color} ${group.badge}`}>
                              {s.plan}
                            </span>
                            <button
                              type="button"
                               onClick={() => setPlanChange({ student: s, plan: "" })}
                              aria-label={`Alterar plano de ${s.name}`}
                              className="rounded-full px-2 py-0.5 text-lg font-bold leading-none text-zinc-400 transition hover:bg-white/10 hover:text-white"
                              title="Alterar plano"
                            >
                              &gt;
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-zinc-500">{s.email}</p>
                          <p className="mt-1 text-sm font-semibold text-amber-300">
                            {calculateAge(s.birthDate) === null ? "Idade não informada" : `${calculateAge(s.birthDate)} anos`}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-600">
                            Cadastrado em {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                          <button
                            onClick={() => setConfirmDelete(s)}
                            disabled={deletingId === s.id || updatingPlanId === s.id}
                            className="rounded-lg border border-red-800/60 px-4 py-2 text-base font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-80"
                          >
                            {deletingId === s.id ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                Excluindo...
                              </span>
                            ) : (
                              "Excluir"
                            )}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {deletingId && (
              <div className="flex items-center gap-3 rounded-xl border border-red-800/60 bg-red-500/10 p-4">
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                <p className="text-sm font-bold text-red-300">Excluindo usuário, aguarde...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {planChange && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => updatingPlanId === null && setPlanChange(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-violet-400/30 bg-zinc-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white">Alterar plano do usuário</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Usuário: <span className="font-semibold text-white">{planChange.student.name}</span>
            </p>
             <label className="mt-5 block text-sm font-semibold text-zinc-300">Novo plano *</label>
            <div className="mt-2"><SelectField value={planChange.plan} onChange={(value) => setPlanChange({ ...planChange, plan: value as "FREE" | "FULL" })} disabled={updatingPlanId !== null} options={[{ value: "FULL", label: "FULL" }, { value: "FREE", label: "FREE" }]} className="font-bold" /></div>
            <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-200">
              Confirma a alteração para o plano {planChange.plan}? Essa modificação muda imediatamente o acesso do usuário.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={confirmPlanChange}
                disabled={updatingPlanId !== null || planChange.plan === planChange.student.plan}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-bold text-zinc-950 disabled:opacity-50"
              >
                {updatingPlanId ? "Salvando..." : "Confirmar alteração"}
              </button>
              <button
                type="button"
                onClick={() => setPlanChange(null)}
                disabled={updatingPlanId !== null}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Excluir usuário"
          message={`Excluir o usuário ${confirmDelete.name}? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={() => {
            handleRemove(confirmDelete.id, confirmDelete.name);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {deleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-violet-400/25 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <p className="text-base font-bold text-emerald-400">
                {deleteSuccess}
              </p>
            </div>
          </div>
        </div>
      )}

      {modalError && (
        <ErrorModal message={modalError} onClose={() => setModalError(null)} />
      )}
    </section>
  );
}
