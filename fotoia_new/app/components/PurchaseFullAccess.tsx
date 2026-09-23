"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/publicPath";

declare global {
  interface Window {
    MercadoPago?: new (key: string, options?: { locale?: string }) => {
      bricks: () => { create: (name: string, container: string, settings: Record<string, unknown>) => Promise<{ unmount: () => void }> };
    };
  }
}

type Props = { plan: "FREE" | "FULL" };

export default function PurchaseFullAccess({ plan }: Props) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [publicKeyLoading, setPublicKeyLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [pix, setPix] = useState<{ qrCode?: string; qrCodeBase64?: string; ticketUrl?: string } | null>(null);
  const cardController = useRef<{ unmount: () => void } | null>(null);

  useEffect(() => {
    if (!open || method !== "card") return;
    let active = true;
    setPublicKeyLoading(true);
    fetch(withBasePath("/api/payments/mercadopago/config"), { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) setPublicKey(typeof data?.publicKey === "string" ? data.publicKey : null);
      })
      .catch(() => {
        if (active) setPublicKey(null);
      })
      .finally(() => {
        if (active) setPublicKeyLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, method]);

  useEffect(() => {
    if (!open || method !== "card") return;
    if (window.MercadoPago) {
      setScriptReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-mercado-pago]");
    if (existing) {
      const handleLoad = () => setScriptReady(true);
      existing.addEventListener("load", handleLoad, { once: true });
      return () => existing.removeEventListener("load", handleLoad);
    }
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.dataset.mercadoPago = "true";
    script.onload = () => setScriptReady(true);
    script.onerror = () => setMessage("Não foi possível carregar o checkout de cartão.");
    document.head.appendChild(script);
  }, [open, method]);

  useEffect(() => {
    if (!open || method !== "card" || !scriptReady || !publicKey || !window.MercadoPago) return;
    let cancelled = false;
    const render = async () => {
      cardController.current?.unmount();
       const mp = new window.MercadoPago!(publicKey, { locale: "pt-BR" });
      const bricksBuilder = mp.bricks();
      const controller = await bricksBuilder.create("cardPayment", "mercado-pago-card", {
        initialization: { amount: 49.90 },
        customization: { paymentMethods: { maxInstallments: 12 } },
        callbacks: {
          onReady: () => {},
          onError: (error: { message?: string; cause?: string }) => {
            console.error("Mercado Pago Card Payment Brick error:", error);
            setMessage(error.cause || error.message || "Confira os dados do cartão e tente novamente.");
          },
          onSubmit: async (formData: Record<string, any>, additionalData: Record<string, any>) => {
            setLoading(true);
            setMessage("");
            try {
              const response = await createOrder({
                method: "card",
                token: formData.token,
                paymentMethodId: formData.payment_method_id,
                paymentTypeId: additionalData.paymentTypeId,
                installments: formData.installments,
                identificationType: formData.payer?.identification?.type,
                identificationNumber: formData.payer?.identification?.number,
               });
               setMessage(response.message);
               setWaitingConfirmation(true);
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Não foi possível processar o cartão.");
              throw error;
            } finally {
              setLoading(false);
            }
          },
        },
      });
      if (!cancelled) cardController.current = controller;
    };
    render().catch((error) => {
      console.error("Mercado Pago Card Payment Brick initialization error:", error);
      setMessage(error instanceof Error ? error.message : "Não foi possível iniciar o checkout de cartão.");
    });
    return () => {
      cancelled = true;
      cardController.current?.unmount();
      cardController.current = null;
    };
  }, [open, method, scriptReady, publicKey]);

  useEffect(() => () => cardController.current?.unmount(), []);

  useEffect(() => {
    if (!waitingConfirmation) return;
    const checkStatus = async () => {
      const response = await fetch(withBasePath("/api/payments/mercadopago/status"), { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (data.plan === "FULL") {
        setWaitingConfirmation(false);
        setPaymentConfirmed(true);
        window.setTimeout(() => window.location.reload(), 2000);
      }
    };
    void checkStatus();
    const timer = window.setInterval(() => void checkStatus(), 3000);
    return () => window.clearInterval(timer);
  }, [waitingConfirmation]);

  async function createOrder(body: Record<string, unknown>) {
    const response = await fetch(withBasePath("/api/payments/mercadopago/order"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Erro ao iniciar pagamento");
    if (data.pix) setPix(data.pix);
    return {
      message: data.status === "processed"
        ? "Pagamento recebido. Seu acesso será atualizado após a confirmação."
        : "Aguardando pagamento. Assim que for confirmado, esta página será atualizada automaticamente.",
    };
  }

  async function startPix() {
    setLoading(true);
    setMessage("");
    try {
      const response = await createOrder({ method: "pix" });
      setMessage(response.message);
      setWaitingConfirmation(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao iniciar PIX.");
    } finally {
      setLoading(false);
    }
  }

  if (plan === "FULL") {
    return null;
  }

  return (
   <section className="rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Acesso completo</p>
           <h2 className="mt-1 text-lg font-medium text-white">Desbloqueie todo o conteúdo e todas as funcionalidades</h2>
           <p className="mt-1 text-sm text-zinc-400">Pagamento único de R$ 49,90.</p>
        </div>
         <button onClick={() => { setOpen(true); setMessage(""); }} className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5">
          Comprar versão completa
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
           <div className="max-h-[94dvh] w-full overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-5 sm:max-w-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-300">Checkout seguro</p>
                 <h3 className="text-lg font-medium text-white">Versão completa · R$ 49,90</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-xl text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
               <button onClick={() => { setMethod("pix"); setPix(null); setMessage(""); }} className={`rounded-lg px-4 py-2.5 text-sm font-medium ${method === "pix" ? "bg-violet-500 text-zinc-950" : "bg-white/5 text-zinc-300"}`}>PIX</button>
               <button onClick={() => { setMethod("card"); setPix(null); setMessage(""); }} className={`rounded-lg px-4 py-2.5 text-sm font-medium ${method === "card" ? "bg-violet-500 text-zinc-950" : "bg-white/5 text-zinc-300"}`}>Cartão</button>
            </div>
            {method === "pix" ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-zinc-400">Gere o QR Code PIX e conclua o pagamento pelo aplicativo do seu banco.</p>
                {!pix ? (
                  <>
                     <button onClick={startPix} disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2.5 font-medium text-zinc-950 disabled:opacity-50">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                          Gerando PIX...
                        </span>
                      ) : "Gerar PIX"}
                    </button>
                    {loading && <p className="text-center text-xs text-zinc-400">Aguarde, isso pode levar alguns segundos.</p>}
                  </>
                ) : (
                  <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-center">
                    {pix.qrCodeBase64 && <img src={`data:image/png;base64,${pix.qrCodeBase64}`} alt="QR Code PIX" className="mx-auto h-48 w-48" />}
                    {pix.qrCode && <button onClick={() => navigator.clipboard.writeText(pix.qrCode!)} className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200">Copiar código PIX</button>}
                    {pix.ticketUrl && <a href={pix.ticketUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-cyan-300 hover:underline">Abrir instruções de pagamento</a>}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5">
                {publicKeyLoading ? <p className="text-sm text-zinc-400">Carregando checkout...</p> : !publicKey ? <p className="text-sm text-amber-300">Chave pública de teste ainda não configurada.</p> : <div id="mercado-pago-card" />}
              </div>
            )}
            {loading && method === "card" && (
              <div className="mt-3 space-y-2 text-center text-sm text-zinc-400">
                <p className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-transparent" />
                  Processando pagamento...
                </p>
                <p className="text-xs">Aguarde a confirmação. Esta página será atualizada automaticamente.</p>
              </div>
            )}
            {message && <p className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-center text-sm text-violet-200">{message}</p>}
          </div>
        </div>
      )}
      {paymentConfirmed && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-sm rounded-xl border border-emerald-400/40 bg-zinc-900 p-5 text-center shadow-2xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/20 text-2xl text-emerald-300">✓</div>
             <p className="mt-3 text-base font-medium text-emerald-300">Pagamento confirmado!</p>
            <p className="mt-1 text-sm text-zinc-400">Atualizando seu acesso...</p>
          </div>
        </div>
      )}
    </section>
  );
}
