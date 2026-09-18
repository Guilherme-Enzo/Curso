const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

const DEFAULT_MODELS = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "google/gemma-4-31b-it:free",
  "openrouter/free",
];

export type RoMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function isOpenRouterConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

export function openRouterModels(): string[] {
  const raw = process.env.OPENROUTER_MODELS;
  if (raw) {
    const list = raw
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (list.length) return list;
  }
  return DEFAULT_MODELS;
}

export function openRouterErrorMessage(err: unknown): string {
  let candidate =
    err instanceof Error ? err.message : String(err ?? "Erro na chamada à IA reserva.");
  try {
    const parsed = JSON.parse(candidate);
    const msg = parsed?.error?.message ?? parsed?.message;
    if (typeof msg === "string" && msg.trim()) candidate = msg;
  } catch {
    // não é JSON: mantém a mensagem
  }
  if (/429|rate.?limit/i.test(candidate)) {
    return "Limite de requisições da IA reserva atingido. Aguarde um pouco e tente novamente.";
  }
  candidate = candidate.replace(/\\n/g, " ").replace(/\\"/g, '"').replace(/\\u003c/g, "<");
  candidate = candidate.replace(/^Error\s*:\s*/i, "").trim();
  return candidate.length > 300 ? `${candidate.slice(0, 300)}...` : candidate;
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "X-Title": "Auto Eletrica App",
  };
}

type RoOptions = { maxTokens?: number; temperature?: number };

async function readErrorBody(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    const data = JSON.parse(raw);
    return data?.error?.message ?? raw;
  } catch {
    return raw;
  }
}

// Faz uma chamada completa (sem stream). Percorre a lista de modelos e
// retorna o primeiro content não vazio. Rejeita somente se todos falharem.
export async function openRouterComplete(
  messages: RoMessage[],
  models: string[],
  opts?: RoOptions
): Promise<string> {
  let lastErr: unknown;
  for (const model of models) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          model,
          messages,
          max_tokens: opts?.maxTokens ?? 4096,
          temperature: opts?.temperature ?? 0.7,
        }),
      });
      if (!res.ok) {
        lastErr = new Error(`[${model}] ${await readErrorBody(res)}`);
        continue;
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim()) return content;
      lastErr = new Error(`[${model}] O modelo reserva não retornou conteúdo.`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Todos os modelos reserva falharam.");
}

// Chamada com streaming (SSE). Conta apenas deltas de `content` (ignora
// `reasoning`). Percorre os modelos; se um não produzir nenhum conteúdo,
// tenta o próximo.
export async function* openRouterStream(
  messages: RoMessage[],
  models: string[],
  opts?: RoOptions
): AsyncGenerator<string> {
  let lastErr: unknown;
  for (const model of models) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          max_tokens: opts?.maxTokens ?? 2048,
          temperature: opts?.temperature ?? 0.7,
        }),
      });
      if (!res.ok || !res.body) {
        lastErr = new Error(`[${model}] ${await readErrorBody(res)}`);
        continue;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let gotContent = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const chunk = JSON.parse(payload);
            const delta = chunk?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta) {
              gotContent = true;
              yield delta;
            }
          } catch {
            // linha SSE incompleta/fragmentada: ignora
          }
        }
      }
      if (gotContent) return;
      lastErr = new Error(`[${model}] O stream reserva não retornou conteúdo.`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Todos os modelos reserva falharam no stream.");
}