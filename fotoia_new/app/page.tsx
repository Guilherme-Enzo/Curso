import Link from "next/link";
import Reveal from "@/app/components/reveal";
import { getPublicModules, type PublicModule } from "@/lib/publicModules";
import { getApiUser } from "@/lib/session";
import Icon, { type IconName } from "@/app/components/Icon";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getApiUser();
  const modules = await getPublicModules({ includeLocked: true, user });
  const lessonCount = modules.reduce((total, module) => total + module.submodules.length, 0);

  return (
    <main className="flex-1 min-h-screen bg-[#0a0a0f] text-zinc-100 antialiased">
      <Navbar />
      <Hero moduleCount={modules.length} lessonCount={lessonCount} />
      <TrustBar />
      <HowItWorks />
      <Modules modules={modules} />
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
  { label: "Modulos", href: "#modulos" },
  { label: "IA", href: "#ia" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Perguntas", href: "#faq" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-violet-400/20 bg-[#0a0a0f]/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-6">
        <a href="#topo" className="flex items-center gap-2">
          <img
             src="/icofotoia-icon.png"
            alt="Retrato ImaginAdo"
             className="h-6 w-6 rounded-lg sm:h-8 sm:w-8 sm:rounded-xl"
          />
          <span className="text-base font-bold tracking-tight text-white sm:text-lg">
            Retrato <span className="text-white"><span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">I</span>magin<span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">A</span>do</span>
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
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-110 sm:px-5 sm:py-2 sm:text-sm"
          >
            Cadastre-se
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero({ moduleCount, lessonCount }: { moduleCount: number; lessonCount: number }) {
  return (
    <section
      className="relative overflow-hidden"
      id="topo"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-600/25 via-cyan-600/10 to-transparent blur-3xl" />
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-cyan-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <div className="mt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
              Fotografia + Inteligencia Artificial
            </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[56px]">
              Crie Imagens{" "}
              <span className="bg-gradient-to-r from-violet-200 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Incriveis com Prompts
              </span>
              <br className="hidden sm:block" /> de Inteligencia Artificial
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
              Domine a arte de escrever prompts profissionais e gere fotos de
              altissima qualidade com{" "}
              <span className="font-semibold text-zinc-300">Midjourney, DALL-E, Stable Diffusion</span>{" "}
              e mais. Do basico ao avancado, com +200 prompts prontos.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="mb-3 text-sm font-medium text-cyan-300">Prompts e módulos atualizados regularmente.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-600 px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 sm:w-auto"
              >
                Comecar agora — e gratis
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/login"
                className="w-full rounded-lg border border-violet-400/25 bg-violet-500/[0.05] px-8 py-3.5 text-base font-medium text-zinc-200 transition hover:border-violet-300/50 hover:bg-violet-500/[0.1] sm:w-auto"
              >
                Ja tenho conta
              </Link>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 grid grid-cols-3 gap-3 rounded-xl border border-violet-400/20 bg-white/[0.03] p-4 sm:mx-auto sm:max-w-xl">
              {[
                { v: String(moduleCount), l: "Modulos completos" },
                { v: String(lessonCount), l: "Aulas praticas" },
                { v: "200+", l: "Prompts prontos" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="text-xl font-semibold text-violet-300 sm:text-2xl">
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
    <section className="border-y border-violet-400/40 bg-violet-500/[0.08]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 sm:px-6">
        {[
          "Midjourney & DALL-E",
          "Stable Diffusion & ControlNet",
          "Prompt Engineering Avancado",
          "Workflows profissionais",
        ].map((t) => (
          <span
            key={t}
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
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
    title: "Crie sua conta gratis",
    desc: "Cadastro rapido, sem cartao. Comece a aprender na hora.",
  },
  {
    n: "2",
    title: "Assista os modulos",
    desc: "Conteudo pratico com prompts prontos e exercicios reais.",
  },
  {
    n: "3",
    title: "Crie suas imagens",
    desc: "Use os prompts nos geradores de IA e crie suas proprias obras.",
  },
  {
    n: "4",
    title: "Evolua e compartilhe",
    desc: "Na comunidade, troque dicas e mostre seus trabalhos.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="border-x border-violet-400/10 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-400">
              Como funciona
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Simples, Pratico e{" "}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Direto ao Ponto
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
                <div className="relative border-t border-violet-400/25 pt-5">
                <span className="font-mono text-xs text-violet-300">
                  {s.n}
                </span>
                <h3 className="mt-3 text-base font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Modules({ modules }: { modules: PublicModule[] }) {
  return (
    <section id="modulos" className="border-t border-violet-400/20 bg-violet-500/[0.04] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-400">
              Programa completo
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {modules.length} Modulos Para Voce{" "}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Dominar a IA
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
              Do basico ao avancado: prompts, ferramentas, estilos, edicao e workflow profissional.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => (
            <Reveal key={mod.id} delay={i * 50}>
              <Link
                href={`/conteudo/${mod.order}`}
                 className="card-interactive group block rounded-xl border border-violet-400/20 bg-white/[0.025] p-5 transition-all hover:border-violet-400/45 hover:bg-violet-500/[0.06]"
               >
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono text-xs tracking-wider text-violet-300">MÓDULO {String(mod.order).padStart(2, "0")}</span>
                  <span className="font-mono text-sm text-zinc-600">
                    {String(mod.order).padStart(2, "0")}/{modules.length}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white transition-colors group-hover:text-violet-300">
                  {mod.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                  {mod.summary || mod.description || "Conteúdo prático de fotografia e edição com IA."}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600">
                   <span className="h-px w-5 bg-violet-400/60" />
                  {mod.submodules.length} aulas
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: "wand" as IconName,
    title: "Prompts com IA",
    desc: "Aprenda a escrever comandos que geram imagens incriveis com Midjourney, DALL-E e Stable Diffusion.",
  },
  {
    icon: "image" as IconName,
    title: "Fotografia Profissional",
    desc: "Composicao, iluminacao, profundidade de campo e outros conceitos que tornam suas criacoes impactantes.",
  },
  {
    icon: "palette" as IconName,
    title: "Estilos e Paletas",
    desc: "Domine a linguagem das cores, temperatura de cor e atmosferas visuais em cada prompt.",
  },
  {
    icon: "spark" as IconName,
    title: "Edicao com IA",
    desc: "Remove backgrounds, substitui objetos, expande cenas e aplica estilos com ferramentas inteligentes.",
  },
  {
    icon: "target" as IconName,
    title: "Prompt Engineering",
    desc: "Tecnicas avancadas como weighting, negative prompts e blending para controle total.",
  },
  {
    icon: "message" as IconName,
    title: "Redes Sociais",
    desc: "Conteudo otimizado para Instagram, TikTok, YouTube e LinkedIn.",
  },
];

function Features() {
  return (
    <section id="diferenciais" className="border-t border-violet-400/20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-400">
              Diferenciais
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Por Que Este Curso e{" "}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Diferente
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="h-full rounded-xl border border-violet-400/20 bg-white/[0.025] p-5">
                <Icon name={f.icon} size={22} className="text-violet-300" />
                <h3 className="mt-5 text-base font-medium text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiSection() {
  return (
    <section id="ia" className="border-t border-violet-400/20 bg-gradient-to-b from-violet-900/10 to-transparent py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
              Ferramentas
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Domine as{" "}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Principais Plataformas
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            {
              name: "Midjourney",
              desc: "O gerador de imagens mais popular do mundo, acessado via Discord. Resultados de altissima qualidade com prompts textuais.",
              gradient: "from-violet-500 to-purple-600",
            },
            {
              name: "DALL-E 3",
              desc: "Integrado ao ChatGPT, permite criacao iterativa de imagens com conversas naturais. Ideal para conceitos complexos.",
              gradient: "from-cyan-500 to-blue-600",
            },
            {
              name: "Stable Diffusion",
              desc: "Open source e gratuito, roda localmente com controle total. Suporta LoRAs, ControlNet e personalizacoes avancadas.",
              gradient: "from-emerald-500 to-teal-600",
            },
          ].map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div className="rounded-2xl border border-violet-400/40 bg-violet-500/[0.08] backdrop-blur-sm p-6">
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${p.gradient} p-3 text-2xl text-white`}>
                  🤖
                </div>
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
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
    name: "Ana Beatriz",
    role: "Designer Freelancer",
    text: "Em 2 semanas ja estava entregando trabalhos para clientes usando Midjourney. O curso e incrivelmente pratico!",
    rating: 5,
  },
  {
    name: "Carlos Eduardo",
    role: "Criador de Conteudo",
    text: "Meu feed do Instagram ficou 10x mais profissional. Os prompts do curso transformaram minha producao visual.",
    rating: 5,
  },
  {
    name: "Juliana Costa",
    role: "Fotografa",
    text: "Achei que IA ia tirar meu trabalho, mas na verdade ampliou minhas possibilidades. Recomendo para todos os fotografos.",
    rating: 5,
  },
  {
    name: "Pedro Henrique",
    role: "Social Media",
    text: "Consegui reduzir meu tempo de producao visual em 70%. O modulo de redes sociais e ouro puro.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section className="border-t border-violet-400/20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
              Depoimentos
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              O Que Nossos Usuários{" "}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Dizem
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="h-full rounded-2xl border border-violet-400/40 bg-violet-500/[0.08] backdrop-blur-sm p-6">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="mb-4 text-sm text-zinc-400 italic leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-zinc-600">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqItems = [
  {
    q: "Preciso ter experiencia com IA para comecar?",
    a: "Nao! O curso comeca do zero absoluto e te guia passo a passo. Voce so precisa de um computador ou celular com internet.",
  },
  {
    q: "Preciso pagar pelo Midjourney ou DALL-E?",
    a: "O Midjourney e pago (plano basico a partir de US$ 10/mes). O DALL-E esta incluso no ChatGPT Plus. Stable Diffusion e gratuito e roda localmente.",
  },
  {
    q: "Quantos prompts vem no curso?",
    a: "Mais de 200 prompts prontos e testados, organizados por estilo e plataforma. Alem de tecnicas para criar seus proprios prompts.",
  },
  {
    q: "Posso usar no celular?",
    a: "Sim! O Midjourney e DALL-E funcionam pelo navegador. O conteudo do curso e acessivel em qualquer dispositivo.",
  },
  {
    q: "Tem garantia?",
    a: "Sim, 7 dias de garantia incondicional. Se nao gostar, devolvemos 100% do seu dinheiro.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "Acesso vitalicio! Assistir quantas vezes quiser, incluindo futuras atualizacoes do curso.",
  },
];

function Faq() {
  return (
    <section id="faq" className="border-t border-violet-400/20 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
              Perguntas frequentes
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Tira Suas Duvidas
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 space-y-4">
          {faqItems.map((item, i) => (
            <Reveal key={i} delay={i * 50}>
              <details className="group rounded-2xl border border-violet-400/40 bg-violet-500/[0.08] backdrop-blur-sm p-5">
                <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-white">
                  {item.q}
                  <span className="ml-4 shrink-0 text-violet-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {item.a}
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
    <section className="relative border-t border-violet-400/20 py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-900/15 to-transparent" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Comece Agora a Criar{" "}
            <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Imagens Incriveis
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
             Junte-se a centenas de usuários que ja transformaram sua criatividade com prompts de IA.
          </p>
          <Link
            href="/register"
            className="group mt-8 inline-flex items-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/40 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-400/60 glow-violet-strong"
          >
            Quero comecar — e gratis
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <p className="mt-4 text-xs text-zinc-600">
            Acesso imediato • Garantia de 7 dias • Sem cartao de credito
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-violet-400/20 bg-[#0a0a0f]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
               <img src="/icofotoia-icon.png" alt="" className="h-7 w-7 rounded-xl" />
              <span className="text-xs font-bold text-white">
                Retrato <span className="text-white"><span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">I</span>magin<span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">A</span>do</span>
              </span>
            </div>
            <p className="mt-4 whitespace-nowrap text-[11px] text-zinc-500 sm:text-sm">
              Plataforma educacional de prompts de fotografia e edição com IA.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-6">
                <a href="https://instagram.com/retratoimaginado" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-zinc-400 transition hover:text-white [&>svg]:hidden">
                  <img src="/instagram-user.png" alt="" className="h-8 w-8" />
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://wa.me/5521977814334" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-zinc-400 transition hover:text-white [&>svg]:h-8 [&>svg]:w-8 [&>svg]:text-[#25D366]">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
