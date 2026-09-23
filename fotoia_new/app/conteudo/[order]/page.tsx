"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AiChatModal from "@/app/components/AiChatModal";
import VideoPlayerModal from "@/app/components/VideoPlayerModal";
import { withBasePath } from "@/lib/publicPath";
import SiteFooter from "@/app/components/SiteFooter";
import Icon from "@/app/components/Icon";

type Submodule = {
  title: string;
  content: string;
  images: string[];
};

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail: string | null;
  duration: number;
  order: number;
  watched: boolean;
  watchedSeconds: number;
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

function videoServeUrl(url: string): string {
  const name = url.split("/").pop();
  return withBasePath(`/api/videos/serve/${name}`);
}

export default function ConteudoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const order = Number(params.order);
  const from = searchParams.get("from");
  const panelHref = from === "admin" ? "/admin" : from === "professor" ? "/professor" : "/aluno";

  const [mod, setMod] = useState<ModuleData | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [canUseAi, setCanUseAi] = useState(false);
  const [showUpgradeNotice, setShowUpgradeNotice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    fetch(withBasePath(`/api/modules/public?order=${order}&t=${Date.now()}`))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
         if (!d) return;
         setAccessDenied(Boolean(d.accessDenied));
         setCanUseAi(Boolean(d.canUseAi));
        const found = d.modules.find((m: ModuleData) => m.order === order);
        setMod(found ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [order]);

  useEffect(() => {
    if (!mod) return;
    fetch(withBasePath(`/api/videos?moduleId=${mod.id}`), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setVideos(d.videos ?? []))
      .catch(() => {});
  }, [mod]);

  useEffect(() => {
    if (!accessDenied) return;
    const timer = window.setTimeout(() => router.replace("/aluno?upgrade=1"), 1800);
    return () => window.clearTimeout(timer);
  }, [accessDenied, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-base text-zinc-500">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-base text-zinc-400">
            {accessDenied ? "Só na versão completa. Atualize seu plano." : "Módulo não encontrado."}
          </p>
          {accessDenied && <p className="mt-2 text-sm text-violet-300">Redirecionando para sua área gratuita...</p>}
          <Link
            href="/aluno"
            className="mt-4 inline-block text-amber-400 hover:underline"
          >
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
             href={panelHref}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <Icon name="arrow-right" size={17} className="rotate-180" />
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Módulo {numStr(mod.order)}
            </p>
            <h1 className="text-2xl font-semibold text-white">{mod.name}</h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-8 space-y-3">
          {mod.pdfUrl ? (
            <div className="flex gap-3">
              <a
                href={mod.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-center text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5"
              >
                Visualizar
              </a>
              <a
                href={mod.pdfUrl}
                download
                className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-200 transition hover:bg-white/5"
              >
                Baixar
              </a>
            </div>
          ) : (
            <p className="rounded-xl border border-zinc-800 px-5 py-3 text-center text-base text-zinc-500">
              PDF em breve
            </p>
          )}
          <button
            onClick={() => canUseAi ? setShowChat(true) : setShowUpgradeNotice(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-600/50 bg-cyan-500/10 py-2.5 text-center text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
             <Icon name="wand" size={16} />
             Estude com a IA sobre este módulo
           </button>
        </div>

        {/* Descrição do módulo */}
        {(mod.description || mod.synopsis) && (
           <div className="mb-6 rounded-xl border border-zinc-800/80 bg-white/[0.02] p-5">
             <h2 className="mb-3 text-base font-medium text-white">Descrição</h2>
            <pre className="whitespace-pre-line text-base leading-relaxed text-zinc-300">
              {mod.description || mod.synopsis}
            </pre>
          </div>
        )}

        {/* Sinopse gerada pela IA */}
        {mod.synopsis && (
           <div className="mb-8 rounded-xl border border-cyan-600/30 bg-cyan-500/5 p-5">
             <h2 className="mb-3 text-base font-medium text-cyan-300">O que você vai estudar</h2>
            <p className="text-base leading-relaxed text-zinc-300">
              {mod.synopsis}
            </p>
          </div>
        )}

        {!mod.description && !mod.synopsis && (
           <div className="mb-8 rounded-xl border border-zinc-800/80 bg-white/[0.02] p-5">
            <p className="text-base text-zinc-400">
              Sinopse deste módulo será disponibilizada em breve.
            </p>
          </div>
        )}

        {/* Vídeos do módulo */}
        {videos.length > 0 && (
          <div className="mb-8">
             <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-white"><Icon name="book" size={17} className="text-violet-300" />Vídeos do módulo</h2>
            <div className="space-y-3">
              {videos.map((v) => {
                return (
                  <button
                    key={v.id}
                    onClick={() => setPlayingVideo(v)}
                     className="card-interactive w-full rounded-xl border border-zinc-800/80 bg-white/[0.02] p-4 text-left transition hover:border-violet-500/40 hover:bg-violet-500/[0.04]"
                  >
                    <div className="flex gap-4">
                       <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                        {v.thumbnail ? (
                          <img src={videoServeUrl(v.thumbnail)} alt={v.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl text-zinc-600">▶</div>
                        )}
                        {v.watched && (
                          <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                         <p className="text-base font-medium text-white">{v.title}</p>
                        {v.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{v.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                          <span>{v.duration > 0 ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, "0")}` : "---"}</span>
                          {v.watched ? (
                            <span className="text-emerald-400">Assistido ✓</span>
                          ) : v.watchedSeconds > 0 ? (
                            <span className="text-amber-400">Faltam {Math.floor((v.duration - v.watchedSeconds) / 60)}:{String((v.duration - v.watchedSeconds) % 60).padStart(2, "0")}</span>
                          ) : (
                            <span>Não assistido</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom buttons */}
        <div className="mt-10 space-y-3">
          {mod.pdfUrl && (
            <div className="flex gap-3">
              <a
                href={mod.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-center text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5"
              >
                Visualizar
              </a>
              <a
                href={mod.pdfUrl}
                download
                className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-center text-sm font-medium text-zinc-200 transition hover:bg-white/5"
              >
                Baixar
              </a>
            </div>
          )}
          <button
            onClick={() => canUseAi ? setShowChat(true) : setShowUpgradeNotice(true)}
             className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-600/50 bg-cyan-500/10 py-2.5 text-center text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
          >
             <Icon name="wand" size={16} />
             Estude com a IA sobre este módulo
          </button>
        </div>

        <div className="mt-8">
          <Link
             href={panelHref}
            className="text-base text-amber-400 hover:underline"
          >
             Voltar ao painel
          </Link>
        </div>
      </div>

      <AiChatModal
        module={showChat ? mod : null}
        onClose={() => setShowChat(false)}
      />

      {showUpgradeNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-sm rounded-xl border border-violet-400/30 bg-zinc-900 p-5 text-center shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Recurso exclusivo</p>
             <p className="mt-2 text-base font-medium text-white">Atualize seu plano para liberar.</p>
            <button
              type="button"
              onClick={() => setShowUpgradeNotice(false)}
              className="mt-5 rounded-xl border border-violet-400/30 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/5"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {playingVideo && (
        <VideoPlayerModal
          url={videoServeUrl(playingVideo.url)}
          title={playingVideo.title}
          videoId={playingVideo.id}
          initialSeconds={playingVideo.watchedSeconds}
          onClose={() => setPlayingVideo(null)}
          onProgress={(sec, watched) => {
            setVideos((prev) =>
              prev.map((v) =>
                v.id === playingVideo.id
                  ? { ...v, watchedSeconds: sec, watched }
                  : v
              )
            );
          }}
        />
      )}
      <SiteFooter backHref={from === "admin" ? "/admin" : "/aluno"} />
    </div>
  );
}
