"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AiChatModal from "@/app/components/AiChatModal";
import QuizModal from "@/app/components/QuizModal";
import VideoPlayerModal from "@/app/components/VideoPlayerModal";

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
  return `/fotoia/api/videos/serve/${name}`;
}

export default function ConteudoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const order = Number(params.order);
  const from = searchParams.get("from");

  const [mod, setMod] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    fetch(`/fotoia/api/modules/public?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const found = d.modules.find((m: ModuleData) => m.order === order);
        setMod(found ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [order]);

  useEffect(() => {
    if (!mod) return;
    fetch(`/fotoia/api/videos?moduleId=${mod.id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setVideos(d.videos ?? []))
      .catch(() => {});
  }, [mod]);

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
          <p className="text-base text-zinc-400">Módulo não encontrado.</p>
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
            href={from === "admin" ? "/admin" : "/aluno"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-700 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            ←
          </Link>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Módulo {numStr(mod.order)}
            </p>
            <h1 className="text-2xl font-bold text-white">{mod.name}</h1>
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
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-center text-base font-bold text-zinc-950 transition hover:-translate-y-0.5"
              >
                Visualizar
              </a>
              <a
                href={mod.pdfUrl}
                download
                className="flex-1 rounded-xl border border-zinc-700 py-3 text-center text-base font-semibold text-zinc-200 transition hover:bg-white/5"
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
            onClick={() => setShowQuiz(true)}
            className="w-full rounded-xl border border-amber-500/50 bg-amber-500/10 py-3 text-center text-base font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            ✅ Fazer avaliação deste módulo
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="w-full rounded-xl border border-cyan-600/50 bg-cyan-500/10 py-3 text-center text-base font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            💬 Estude com a IA sobre este módulo
          </button>
        </div>

        {/* Descrição do módulo */}
        {(mod.description || mod.synopsis) && (
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-3 text-lg font-bold text-white">Descrição</h2>
            <pre className="whitespace-pre-line text-base leading-relaxed text-zinc-300">
              {mod.description || mod.synopsis}
            </pre>
          </div>
        )}

        {/* Sinopse gerada pela IA */}
        {mod.synopsis && (
          <div className="mb-8 rounded-2xl border border-cyan-600/30 bg-cyan-500/5 p-6">
            <h2 className="mb-3 text-lg font-bold text-cyan-300">O que você vai estudar</h2>
            <p className="text-base leading-relaxed text-zinc-300">
              {mod.synopsis}
            </p>
          </div>
        )}

        {!mod.description && !mod.synopsis && (
          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-base text-zinc-400">
              Sinopse deste módulo será disponibilizada em breve.
            </p>
          </div>
        )}

        {/* Vídeos do módulo */}
        {videos.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-white">🎬 Vídeos do módulo</h2>
            <div className="space-y-3">
              {videos.map((v) => {
                return (
                  <button
                    key={v.id}
                    onClick={() => setPlayingVideo(v)}
                    className="w-full text-left rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-violet-500/40 hover:bg-zinc-800/60"
                  >
                    <div className="flex gap-4">
                      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
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
                        <p className="text-base font-bold text-white">{v.title}</p>
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
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-center text-base font-bold text-zinc-950 transition hover:-translate-y-0.5"
              >
                Visualizar
              </a>
              <a
                href={mod.pdfUrl}
                download
                className="flex-1 rounded-xl border border-zinc-700 py-3 text-center text-base font-semibold text-zinc-200 transition hover:bg-white/5"
              >
                Baixar
              </a>
            </div>
          )}
          <button
            onClick={() => setShowQuiz(true)}
            className="w-full rounded-xl border border-amber-500/50 bg-amber-500/10 py-3 text-center text-base font-semibold text-amber-300 transition hover:bg-amber-500/20"
          >
            ✅ Fazer avaliação deste módulo
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="w-full rounded-xl border border-cyan-600/50 bg-cyan-500/10 py-3 text-center text-base font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            💬 Estude com a IA sobre este módulo
          </button>
        </div>

        <div className="mt-8">
          <Link
            href={from === "admin" ? "/admin" : "/aluno"}
            className="text-base text-amber-400 hover:underline"
          >
            ← Voltar ao painel
          </Link>
        </div>
      </div>

      <AiChatModal
        module={showChat ? mod : null}
        onClose={() => setShowChat(false)}
      />

      {showQuiz && (
        <QuizModal
          moduleOrder={order}
          moduleName={mod.name}
          onClose={() => setShowQuiz(false)}
        />
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
    </div>
  );
}
