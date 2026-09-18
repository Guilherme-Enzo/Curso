"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  title: string;
  videoId: string;
  initialSeconds?: number;
  onClose: () => void;
  onProgress?: (seconds: number, watched: boolean) => void;
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoPlayerModal({
  url,
  title,
  videoId,
  initialSeconds = 0,
  onClose,
  onProgress,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [seeked, setSeeked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const hasProgress = initialSeconds > 5;

  // Save progress on unmount
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v && v.duration > 0 && videoId) {
        const sec = Math.floor(v.currentTime);
        const watched = v.currentTime >= v.duration - 5;
        navigator.sendBeacon(
          "/fotoia/api/videos/" + videoId + "/progress",
          new Blob([JSON.stringify({ seconds: sec, watched })], { type: "application/json" })
        );
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [videoId]);

  // Seek to initial position once video metadata loads
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    function onLoaded() {
      const vid = videoRef.current;
      if (vid && initialSeconds > 0) {
        vid.currentTime = initialSeconds;
      }
      setSeeked(true);
    }
    if (v.readyState >= 1) {
      onLoaded();
    } else {
      v.addEventListener("loadedmetadata", onLoaded, { once: true });
      return () => v.removeEventListener("loadedmetadata", onLoaded);
    }
  }, [initialSeconds]);

  // Attach video events for saving progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    function saveProgress() {
      if (!v || v.duration <= 0) return;
      const sec = Math.floor(v.currentTime);
      const watched = v.currentTime >= v.duration - 5;
      fetch("/fotoia/api/videos/" + videoId + "/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seconds: sec, watched }),
      });
      onProgressRef.current?.(sec, watched);
    }

    function onTimeUpdate() {
      if (timerRef.current) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        saveProgress();
      }, 5000);
    }

    function onEnded() {
      setPlaying(false);
      saveProgress();
    }

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [videoId]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleChoice(continueWatch: boolean) {
    setChosen(true);
    const v = videoRef.current;
    if (!v) return;
    if (continueWatch && initialSeconds > 0) {
      v.currentTime = initialSeconds;
    } else {
      v.currentTime = 0;
    }
    v.play().catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-sm text-zinc-400 hover:text-white"
        >
          Fechar ✕
        </button>
        <h3 className="mb-3 text-lg font-bold text-white">{title}</h3>
        <div className="relative">
          <video
            ref={videoRef}
            controls
            playsInline
            className="w-full rounded-xl bg-black"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src={url} />
            Seu navegador não suporta vídeo.
          </video>

          {/* Modal de continuar ou reiniciar */}
          {hasProgress && !chosen && seeked && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/70">
              <div className="text-center space-y-4 p-6">
                <p className="text-base font-bold text-white">
                  Você já assistiu até {formatTime(initialSeconds)}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => handleChoice(true)}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-base font-bold text-white transition hover:-translate-y-0.5"
                  >
                    ▶ Continuar de {formatTime(initialSeconds)}
                  </button>
                  <button
                    onClick={() => handleChoice(false)}
                    className="rounded-xl border border-zinc-600 px-6 py-3 text-base font-bold text-zinc-300 transition hover:bg-white/5"
                  >
                    ↺ Reiniciar do início
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
