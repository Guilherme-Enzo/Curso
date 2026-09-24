"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/publicPath";

type CodeClient = { requestCode: () => void };
type GoogleWindow = Window & { google?: { accounts: { oauth2: { initCodeClient: (options: {
  client_id: string;
  scope: string;
  ux_mode: "popup";
  callback: (response: { code?: string; error?: string }) => void;
  error_callback: () => void;
}) => CodeClient } } } };

export default function GoogleLoginButton() {
  const [error, setError] = useState("");
  const client = useRef<CodeClient | null>(null);

  useEffect(() => {
    let active = true;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = async () => {
      try {
        const response = await fetch(withBasePath("/api/auth/google?format=config"));
        if (!response.ok) throw new Error("google_config");
        const { clientId } = await response.json() as { clientId: string };
        if (!active) return;
        client.current = (window as GoogleWindow).google!.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: "openid email profile",
          ux_mode: "popup",
          callback: async ({ code, error: googleError }) => {
            if (!code || googleError) {
              setError("Não foi possível entrar com o Google. Tente novamente.");
              return;
            }
            try {
              const result = await fetch(withBasePath("/api/auth/google/callback"), {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Requested-With": "XmlHttpRequest" },
                body: JSON.stringify({ code }),
              });
              const data = await result.json() as { destination?: string };
              if (!result.ok || !data.destination) throw new Error("google_login");
              window.location.assign(withBasePath(data.destination));
            } catch {
              setError("Não foi possível entrar com o Google. Tente novamente.");
            }
          },
          error_callback: () => setError("Não foi possível abrir o Google. Verifique os pop-ups do navegador."),
        });
      } catch {
        if (active) setError("Não foi possível carregar o login Google. Atualize a página.");
      }
    };
    script.onerror = () => { if (active) setError("Não foi possível carregar o login Google. Atualize a página."); };
    document.head.appendChild(script);
    return () => { active = false; client.current = null; script.remove(); };
  }, []);

  function startGoogleLogin() {
    setError("");
    if (client.current) client.current.requestCode();
    else setError("O login Google ainda está carregando. Tente novamente em instantes.");
  }

  return (
    <div>
      <button type="button" onClick={startGoogleLogin} className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-white px-4 py-2.5 font-medium text-zinc-800 transition hover:bg-zinc-100">
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M21.35 12.27c0-.68-.06-1.34-.18-1.97H12v3.73h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.7 2.92-4.2 2.92-7.13Z" />
          <path fill="#34A853" d="M12 21.72c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0 0 12 21.72Z" />
          <path fill="#FBBC05" d="M6.53 13.81a5.85 5.85 0 0 1 0-3.62V7.67H3.28a9.73 9.73 0 0 0 0 8.66l3.25-2.52Z" />
          <path fill="#EA4335" d="M12 6.16c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.25 14.63 2.28 12 2.28a9.74 9.74 0 0 0-8.72 5.39l3.25 2.52C7.3 7.88 9.46 6.16 12 6.16Z" />
        </svg>
        Continuar com Google
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
