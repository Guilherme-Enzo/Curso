"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/publicPath";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [postponeNotice, setPostponeNotice] = useState(false);

  function wasRecentlyCancelled() {
    const value = window.localStorage.getItem("retrato-install-dismissed-at");
    return value ? Date.now() - Number(value) < 7 * 24 * 60 * 60 * 1000 : false;
  }

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone) return;

    void navigator.serviceWorker?.register(withBasePath("/sw.js"), { scope: withBasePath("/") });

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
    setIos(isIos);
    if (isIos && !wasRecentlyCancelled()) setVisible(true);

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (!wasRecentlyCancelled()) {
        setInstallEvent(event as InstallEvent);
        setVisible(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setVisible(false);
  }

  function postpone() {
    window.localStorage.setItem("retrato-install-dismissed-at", String(Date.now()));
    setPostponeNotice(true);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-4 z-[70] mx-auto max-w-xl rounded-2xl border border-violet-400/35 bg-zinc-900/95 p-4 shadow-2xl shadow-violet-950/40 backdrop-blur sm:inset-x-auto sm:right-6 sm:w-[min(420px,calc(100vw-3rem))]">
      <div className="flex items-start gap-3">
        <img src="/pwa-icon.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{postponeNotice ? "Instalação adiada" : "Instalar Retrato ImaginAdo"}</p>
          {postponeNotice ? (
            <p className="mt-1 text-sm leading-relaxed text-emerald-300">Este aviso não será mostrado novamente por uma semana.</p>
          ) : ios ? (
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">Toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p>
          ) : (
             <p className="mt-1 text-sm leading-relaxed text-zinc-300">Crie um atalho para abrir o painel como aplicativo.</p>
          )}
          {postponeNotice ? (
            <button type="button" onClick={() => setVisible(false)} className="mt-3 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/5">Fechar</button>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {!ios && installEvent && <button type="button" onClick={install} className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950">Instalar aplicativo</button>}
              <button type="button" onClick={postpone} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/5">Adiar</button>
            </div>
          )}
        </div>
        <button type="button" onClick={() => setVisible(false)} aria-label="Fechar" className="text-lg text-zinc-500 hover:text-white">✕</button>
      </div>
    </div>
  );
}
