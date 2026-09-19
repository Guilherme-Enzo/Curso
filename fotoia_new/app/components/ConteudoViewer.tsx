"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { withBasePath } from "@/lib/publicPath";

type Submodule = {
  title: string;
  content: string;
  images: string[];
};

type ModuleData = {
  id: string;
  order: number;
  name: string;
  description: string | null;
  synopsis: string | null;
  pdfUrl: string | null;
  icon: string;
  tag: string;
  summary: string;
  submodules: Submodule[];
};

const numStr = (n: number) => String(n).padStart(2, "0");

export default function ConteudoViewer() {
  const [modules, setModules] = useState<ModuleData[] | null>(null);

  useEffect(() => {
    fetch(withBasePath("/api/modules/public"))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setModules(d.modules))
      .catch(() => {});
  }, []);

  if (!modules) {
    return <p className="text-base text-zinc-500">Carregando módulos...</p>;
  }

  if (modules.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-lg text-zinc-400">
        Nenhum módulo disponível ainda.
      </p>
    );
  }

  return (
    <section className="mt-6 space-y-4">
      <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-base leading-relaxed text-zinc-300">
        Visualize o conteúdo que os alunos enxergam em cada módulo.
      </p>

      <div className="grid gap-4">
        {modules.map((mod) => (
          <article
            key={mod.order}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-xl">
                {mod.icon}
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  Módulo {numStr(mod.order)}
                </p>
                <h2 className="text-2xl font-bold text-white">{mod.name}</h2>
              </div>
            </div>

            {mod.description ? (
              <pre className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                {mod.description}
              </pre>
            ) : mod.synopsis ? (
              <pre className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                {mod.synopsis}
              </pre>
            ) : null}

            {mod.synopsis && (
              <div className="mt-3 rounded-xl border border-cyan-600/30 bg-cyan-500/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
                  Sinopse (IA)
                </p>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {mod.synopsis}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/conteudo/${mod.order}?from=admin`}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-zinc-950 transition hover:-translate-y-0.5"
              >
                Visualizar como aluno
              </Link>
              {mod.pdfUrl && (
                <a
                  href={mod.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/5"
                >
                  PDF
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
