import { createHmac, timingSafeEqual } from "crypto";

export const FULL_PRICE_CENTS = 4990;
export const FULL_PRICE = "49.90";
export const FULL_CURRENCY = "BRL";

type Payment = {
  id?: string;
  amount?: string;
  status?: string;
  status_detail?: string;
  payment_method?: {
    id?: string;
    type?: string;
    token?: string;
    installments?: number;
    data?: Record<string, unknown>;
  };
  [key: string]: unknown;
};

export type MercadoPagoOrder = {
  id?: string;
  status?: string;
  status_detail?: string;
  total_amount?: string;
  total_paid_amount?: string;
  currency_id?: string;
  currency?: string;
  external_reference?: string;
  transactions?: { payments?: Payment[] };
  [key: string]: unknown;
};

function accessToken(): string {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado");
  return token;
}

export async function mercadoPagoRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken()}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(data?.errors)
      ? data.errors.map((item: { code?: string; message?: string; details?: string[] }) => [
          item.code,
          item.message,
          ...(item.details ?? []),
        ].filter(Boolean).join(": ")).filter(Boolean).join("; ")
      : "";
    const message = details || (typeof data?.message === "string" ? data.message : "Erro na API do Mercado Pago");
    throw new Error(`${message} (${response.status})`);
  }
  return data as T;
}

export function paymentFromOrder(order: MercadoPagoOrder): Payment | null {
  return order.transactions?.payments?.[0] ?? null;
}

export function isApprovedOrder(order: MercadoPagoOrder): boolean {
  const payment = paymentFromOrder(order);
  const paidAmount = Number(order.total_paid_amount ?? payment?.amount ?? 0);
  return order.status === "processed"
    && payment?.status === "processed"
    && payment.status_detail === "accredited"
    && Math.round(paidAmount * 100) === FULL_PRICE_CENTS;
}

export function isRevokedOrder(order: MercadoPagoOrder): boolean {
  const payment = paymentFromOrder(order);
  return order.status === "refunded"
    || order.status === "canceled"
    || order.status === "charged_back"
    || payment?.status === "refunded"
    || payment?.status === "canceled";
}

export function validateOrderAmount(order: MercadoPagoOrder): boolean {
  const total = Number(order.total_amount ?? 0);
  const paid = Number(order.total_paid_amount ?? order.transactions?.payments?.[0]?.amount ?? 0);
  return Math.round(total * 100) === FULL_PRICE_CENTS
    && (order.total_paid_amount === undefined || Math.round(paid * 100) === FULL_PRICE_CENTS);
}

function findNestedString(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findNestedString(item, key);
      if (found) return found;
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record[key] === "string") return record[key];
  for (const child of Object.values(record)) {
    const found = findNestedString(child, key);
    if (found) return found;
  }
  return undefined;
}

export function validateWebhookSignature(request: Request, dataId: string): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!secret || !signature || !requestId || !dataId) return false;

  const values = Object.fromEntries(signature.split(",").map((part) => {
    const [key, value] = part.trim().split("=", 2);
    return [key, value];
  }));
  const ts = values.ts;
  const v1 = values.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(v1, "utf8");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function extractPixData(order: MercadoPagoOrder): { qrCode?: string; qrCodeBase64?: string; ticketUrl?: string } {
  return {
    qrCode: findNestedString(order, "qr_code"),
    qrCodeBase64: findNestedString(order, "qr_code_base64"),
    ticketUrl: findNestedString(order, "ticket_url"),
  };
}
