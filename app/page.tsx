import Link from "next/link";
import Reveal from "@/app/components/reveal";
import { MODULES } from "@/lib/modules";

const SUBMODULE_COUNT = MODULES.reduce((acc, m) => acc + m.submodules.length, 0);

export default function Home() {
  return (
    <main className="flex-1 min-h-screen bg-[#07070b] text-zinc-100 antialiased">
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Modules />
      <Features />
      <AiSection />
      <Testimonials />
      <Faq />
      <CallToAction />
      <Footer />
    </main>
  );
}

const navLinks = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Cursos", href: "#cursos" },
  { label: "IA", href: "#ia" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Perguntas", href: "#faq" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07070b]/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#topo" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-lg font-black text-zinc-950 shadow-lg shadow-orange-600/30">
            ⚡
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Auto <span className="text-amber-400">Elétrica</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5 hover:shadow-orange-500/50 sm:px-5"
          >
            Cadastre-se
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      id="topo"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-600/25 via-orange-600/10 to-transparent blur-3xl" />
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-blue-700/15 blur-3xl" />
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#07070b] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              Diagnóstico na prática, na sua oficina
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-6 text-balance text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[64px]">
              Domine a{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Eletricidade e Injeção Eletrônica
              </span>
              <br className="hidden sm:block" /> Automotiva do Zero ao Avançado
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
              Cansado de trocar peça por tentativa e erro? Aqui você aprende a
              ler o que o scanner tá te dizendo — do zero da injeção eletrônica
              até o diagnóstico profissional em 10 módulos baseados no livro{" "}
              <span className="font-semibold text-zinc-300">
                “Injeção Eletrônica — Os Fundamentos”
              </span>
              . Aprendeu, já aplica no carro.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-base font-bold text-zinc-950 shadow-xl shadow-orange-600/30 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/50 sm:w-auto"
              >
                Começar agora — é grátis
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 text-base font-semibold text-zinc-200 backdrop-blur transition hover:border-white/25 hover:bg-white/[0.08] sm:w-auto"
              >
                Já tenho conta
              </Link>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur sm:mx-auto sm:max-w-xl">
              {[
                { v: "10", l: "Módulos do livro" },
                { v: String(SUBMODULE_COUNT), l: "Submódulos organizados" },
                { v: "100", l: "Perguntas de avaliação" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-2xl font-black text-amber-400 sm:text-3xl">
                    {s.v}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 sm:text-xs">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-white/5 bg-white/[0.02]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 sm:px-6">
        {[
          "Multímetro & osciloscópio",
          "Diagramas elétricos em PDF",
          "Professores com experiência em campo",
          "Acesso no celular da oficina",
        ].map((t) => (
          <span
            key={t}
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

const steps = [
  {
    n: "1",
    title: "Crie sua conta grátis",
    desc: "Cadastro rápido com perfil de aluno ou professor. Sem cartão, sem mensalidade escondida.",
  },
  {
    n: "2",
    title: "Estude módulo por módulo",
    desc: "Cada módulo tem teoria enxuta, exemplos reais de oficina e material em PDF pra baixar.",
  },
  {
    n: "3",
    title: "Pergunte e seja avaliado",
    desc: "Manda a dúvida pro professor quando travar e fecha cada módulo com uma avaliação.",
  },
];

function HowItWorks() {
  return (
    <section
      className="relative border-t border-white/5 py-24"
      id="como-funciona"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Da conta até o diagnóstico em 3 passos
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="group relative h-full rounded-2xl border border-white/8 bg-white/[0.03] p-7 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-lg font-black text-amber-400 transition group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-zinc-950">
                    {s.n}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const modules = MODULES.map((m) => ({
  num: m.num,
  title: m.title,
  desc: m.summary,
  tag: m.tag,
  icon: m.icon,
}));

function Modules() {
  return (
    <section
      className="relative border-t border-white/5 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent py-24"
      id="cursos"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              O plano de estudos
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              10 módulos do livro: do Triplo C ao sistema de alimentação
            </h2>
            <p className="mt-4 text-zinc-400">
              Cada módulo é dividido em submódulos com teoria enxuta, figuras
              do livro e avaliação final. Você só avança quando compra o
              conteúdo de verdade — ao lado do carro, não numa apostila de
              material.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <Reveal key={m.num} delay={(i % 3) * 100}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10">
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/25" />
                <div className="relative flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] text-xl transition group-hover:bg-amber-500/15">
                    {m.icon}
                  </span>
                  <span className="text-4xl font-black text-white/10 transition-colors group-hover:text-amber-500/40">
                    {m.num}
                  </span>
                </div>
                <h3 className="relative mt-4 text-lg font-bold text-white">
                  {m.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">
                  {m.desc}
                </p>
                <span className="relative mt-4 inline-block rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  {m.tag}
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Materiais em PDF prontos pra oficina",
    desc: "Baixe os módulos em PDF e abra no celular ao lado do carro. Sem enrolação: medição, pinagem e passo a passo.",
    icon: "📄",
  },
  {
    title: "Canal de Dúvidas direto com professor",
    desc: "Travou num diagrama ou num sinal? A pergunta vai direto pro professor. Sem esperar semanas por fórum.",
    icon: "💬",
  },
  {
    title: "Avaliação por módulo, com ritmo seu",
    desc: "Prova ao final de cada módulo. Acompanhe teu progresso e veja exatamente onde precisa reforçar.",
    icon: "✅",
  },
];

function Features() {
  return (
    <section
      className="relative border-t border-white/5 py-24"
      id="diferenciais"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Na oficina é outra coisa
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Aprendeu, foi direto pro carro. Duvidou, perguntou. Virou
              profissional.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="relative h-full rounded-2xl border border-white/8 bg-zinc-950/70 p-7 backdrop-blur transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 grid gap-5 rounded-2xl border border-white/8 bg-gradient-to-r from-zinc-900/80 to-zinc-950/80 p-8 sm:grid-cols-4 sm:p-10">
            {[
              { t: "Multímetro", d: "Voltagem, resistência e continuidade em minutos" },
              { t: "Osciloscópio", d: "Veja o sinal dos sensores no tempo real" },
              { t: "Scanner OBD", d: "Leia códigos de falha com confiança" },
              { t: "Diagrama 1:1", d: "Compare o mapa do carro com o físico" },
            ].map((c) => (
              <div key={c.t} className="text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  {c.t}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const aiPoints = [
  {
    icon: "🤖",
    title: "Quizzes gerados pela IA",
    desc: "A cada módulo publicado, a inteligência artificial lê o PDF e monta uma avaliação de 10 perguntas focadas no conteúdo — nada de banco de questões genérico.",
  },
  {
    icon: "🎯",
    title: "Perguntas que pegam",
    desc: "Questões objetivas com alternativas que cobrem os pontos-chave do módulo, do fundamento ao diagnóstico, como se um professor revisasse tuas respostas.",
  },
  {
    icon: "🔄",
    title: "Sempre em dia",
    desc: "Trocou ou atualizou o material? A IA regenera o quiz automaticamente, mantendo a avaliação alinhada ao que você acabou de estudar.",
  },
];

function AiSection() {
  return (
    <section className="relative border-t border-white/5 py-24" id="ia">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Inteligência artificial no teu estudo
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              A IA está dentro do teu aprendizado
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Usamos inteligência artificial em toda a plataforma pra deixar o
              estudo mais perto da realidade da oficina. A IA lê o PDF de cada
              módulo e monta uma avaliação de 10 perguntas sobre o conteúdo
              real do material — pra você estudar do jeito certo, direto do
              que o professor ensina.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {aiPoints.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}>
              <div className="relative h-full rounded-2xl border border-white/8 bg-zinc-950/70 p-7 backdrop-blur transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-orange-600/20 text-2xl">
                  {p.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {p.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "Eu trocava sensor por teimosia. Depois do Módulo 3, leio o MAF na tela do osciloscópio e acho a falha na primeira.",
    name: "Carlos M.",
    role: "Aluno · Mecânico há 8 anos",
  },
  {
    quote:
      "O professor respondeu a dúvida sobre a sonda lambda no mesmo dia. Isso não existe em curso online.",
    name: "Jéssica R.",
    role: "Aluna · Elétrica automotiva",
  },
  {
    quote:
      "Montei o próprio passo a passo pro diagnóstico de bobina e parei de perder cliente com volta de carro.",
    name: "André S.",
    role: "Aluno · Dono de oficina",
  },
];

function Testimonials() {
  return (
    <section className="relative border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Quem já mergulhou
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Resultados de quem caiu na oficina aprendendo
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <figure className="relative h-full rounded-2xl border border-white/8 bg-white/[0.03] p-7 backdrop-blur transition hover:border-white/20">
                <span className="absolute left-6 top-4 text-5xl leading-none text-amber-500/30">
                  "
                </span>
                <blockquote className="relative mt-4 text-sm leading-relaxed text-zinc-300">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/30 text-sm font-bold text-amber-300">
                    {t.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Preciso saber elétrica pra começar?",
    a: "Não. O Módulo 1 foi feito pra quem começa do zero absoluto: corrente, tensão, resistência e o básico do chicote — tudo explicado com exemplos de carro real.",
  },
  {
    q: "Como acesso os materiais na oficina?",
    a: "Tudo é aberto no navegador do celular ou tablet. Os PDFs de cada módulo podem ser baixados pra ler ao lado do carro, mesmo sem internet.",
  },
  {
    q: "Funciona pra quem já é mecânico?",
    a: "Sim. Os módulos avançados (Sensores, Atuadores, Diagnóstico) organizam o que você já faz no dia a dia num método que elimina tentativa e erro.",
  },
  {
    q: "As avaliações valem certificado?",
    a: "Cada módulo tem uma avaliação. Concluir os 10 módulos te dá um histórico de progresso — e em breve, certificado de conclusão.",
  },
  {
    q: "E se eu travar numa dúvida?",
    a: "Você usa o Canal de Dúvidas e manda a pergunta direto pro professor. O objetivo é você não ficar parado esperando resposta de fórum.",
  },
];

function Faq() {
  return (
    <section
      className="relative border-t border-white/5 py-24"
      id="faq"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
              Perguntas frequentes
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              O que você precisa saber antes de começar
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="group rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur transition hover:border-white/20 open:bg-white/[0.05]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-amber-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="border-t border-white/5 py-24" id="estrutura">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-64 w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/15 blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
            </div>
            <div className="relative">
              <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Seu primeiro sinal de "ligou" começa aqui.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-zinc-300">
                Cria tua conta grátis agora e abre o Módulo 1 hoje mesmo. Em
                poucos meses, tu tá diagnosticando falha que nem scanner caro
                confirma.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="group w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-base font-bold text-zinc-950 shadow-xl shadow-orange-600/30 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-orange-500/50 sm:w-auto"
                >
                  Criar conta grátis agora
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="w-full rounded-xl border border-white/15 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/[0.06] sm:w-auto"
                >
                  Entrar na minha conta
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-black text-zinc-950">
                ⚡
              </span>
              <span className="text-lg font-bold text-white">
                Auto <span className="text-amber-400">Elétrica</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
              Plataforma educacional de elétrica e injeção eletrônica
              automotiva. Do fundamento ao diagnóstico avançado, direto pra
              oficina. Feito pra quem trabalha com as mãos.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Navegação</p>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
              <li><a href="#topo" className="transition hover:text-white">Início</a></li>
              <li><a href="#como-funciona" className="transition hover:text-white">Como funciona</a></li>
              <li><a href="#cursos" className="transition hover:text-white">Plano de estudos</a></li>
              <li><a href="#ia" className="transition hover:text-white">IA no estudo</a></li>
              <li><a href="#faq" className="transition hover:text-white">Perguntas frequentes</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Conta</p>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
              <li><Link href="/login" className="transition hover:text-white">Entrar</Link></li>
              <li><Link href="/register" className="transition hover:text-white">Criar conta</Link></li>
              <li><Link href="/dashboard" className="transition hover:text-white">Área do aluno</Link></li>
              <li><Link href="/professor" className="transition hover:text-white">Painel do professor</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Auto Elétrica. Todos os direitos reservados.</p>
          <p>Elétrica & Injeção Eletrônica Automotiva</p>
        </div>
      </div>
    </footer>
  );
}