import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { resolveFile } from "@/lib/upload";
import { MODULES } from "@/lib/modules";
import {
  isOpenRouterConfigured,
  openRouterComplete,
  openRouterErrorMessage,
  openRouterModels,
  openRouterStream,
} from "@/lib/openrouter";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  buffer: Buffer
) => Promise<{ text: string }>;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const MAX_TEXT_CHARS = 80000;
const HISTORY_MESSAGES = 10;
const CACHE_DIR = path.join(process.cwd(), "public", "uploads", "ia");

export type ChatMessage = { role: "user" | "assistant"; content: string };

type GeminiChunk = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

function geminiErrorMessage(err: unknown): string {
  let candidate = err instanceof Error ? err.message : String(err ?? "Erro na chamada à IA.");
  // O ApiError do SDK pode ter err.message = {"error":{"message":"<JSON-STRING>"}}:
  // desembrulha o campo "message" até sobrar texto legível.
  for (let depth = 0; depth < 3; depth++) {
    try {
      const parsed = JSON.parse(candidate);
      const msg = parsed?.error?.message ?? parsed?.message;
      if (typeof msg === "string" && msg.trim() && msg !== candidate) {
        candidate = msg;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  if (/RESOURCE_EXHAUSTED|429|rate.limit/i.test(candidate)) {
    return "Limite de requisições da IA atingido. Aguarde alguns minutos e tente novamente.";
  }
  candidate = candidate.replace(/\\n/g, " ").replace(/\\"/g, '"').replace(/\\u003c/g, "<");
  candidate = candidate.replace(/^Error\s*:\s*/i, "").trim();
  return candidate.length > 300 ? `${candidate.slice(0, 300)}...` : candidate;
}

// Extrai (e cacheia em disco) o texto do PDF do módulo. A cache fica chaveada
// pelo nome do arquivo (UUID gerado no upload), então trocar o PDF gera um
// novo arquivo automaticamente.

// Gets module content: tries PDF first, falls back to static content from lib/modules.ts
export async function getModuleContentFlexible(
  pdfUrl: string | null,
  moduleName: string,
  moduleOrder?: number
): Promise<string> {
  if (pdfUrl) {
    try {
      return await getModuleContent(pdfUrl);
    } catch {
      // PDF failed, try static content below
    }
  }
  if (moduleOrder) {
    const mod = MODULES.find((m) => m.id === moduleOrder);
    if (mod && mod.submodules?.length) {
      return mod.submodules
        .map((s) => "## " + s.title + "\n" + s.content)
        .join("\n\n");
    }
  }
  const nameLower = moduleName.toLowerCase();
  const mod = MODULES.find(
    (m) =>
      m.title.toLowerCase().includes(nameLower) ||
      nameLower.includes(m.title.toLowerCase())
  );
  if (mod && mod.submodules?.length) {
    return mod.submodules
      .map((s) => "## " + s.title + "\n" + s.content)
      .join("\n\n");
  }
  throw new Error(
    "Este módulo ainda não possui conteúdo disponível (PDF ou texto)."
  );
}

export async function getModuleContent(pdfUrl: string): Promise<string> {
  const key = path.basename(pdfUrl);
  const file = path.join(CACHE_DIR, `${key}.txt`);
  try {
    const cached = await readFile(file, "utf8");
    if (cached.trim()) return cached;
  } catch {
    // cache miss: extrai abaixo
  }
  const data = await readFile(resolveFile(pdfUrl));
  const parsed = await pdfParse(data);
  const text = (parsed.text ?? "").trim();
  if (!text) {
    throw new Error(
      "Não foi possível extrair o texto do PDF (pode ser escaneado, sem camada de texto)."
    );
  }
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, text, "utf8");
  return text;
}

function buildPrompt(moduleName: string, text: string, history: ChatMessage[]): string {
  const historyBlock = history.length
    ? history
        .map((m) => `${m.role === "user" ? "Aluno" : "Professor"}: ${m.content}`)
        .join("\n\n")
    : "(ainda não há conversa anterior)";

  return [
    `Você é o professor responsável pelo módulo "${moduleName}".`,
    "REGRAS ESTRTAS:",
    "1. Responda APENAS com base no conteúdo do módulo fornecido abaixo.",
    "2. NÃO use conhecimento de outros módulos ou temas fora deste módulo.",
    "3. Se a pergunta for sobre um assunto que NÃO está no conteúdo deste módulo, responda educadamente: 'Esse assunto não faz parte deste módulo. Para esse conteúdo, consulte o módulo correspondente.'",
    "4. Temas diretamente relacionados ao assunto específico deste módulo (e que estejam no conteúdo) podem ser respondidos.",
    "5. Seja direto, didático e use linguagem acessível.",
    "",
    "CONTEÚDO DO MÓDULO (fonte ÚNICA de informação):",
    text.slice(0, MAX_TEXT_CHARS),
    "",
    "HISTÓRICO DA CONVERSA:",
    historyBlock,
    "",
    "Responda agora a pergunta do aluno em markdown simples: títulos com ##, negrito com ** e listas com -.",
    "Qualquer fórmula deve sair em LaTeX: fórmulas curtas entre $...$ e fórmulas grandes entre $$...$$.",
    "No final da resposta, faça UMA pergunta curta oferecendo ajuda sobre algum tópico do módulo.",
  ].join("\n");
}

function parseSuggestions(raw: string): string[] {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("A IA não retornou sugestões válidas.");
  }
  const parsed = JSON.parse(raw.slice(start, end + 1));
  const list = Array.isArray(parsed?.suggestions)
    ? parsed.suggestions.map((s: unknown) => String(s ?? "").trim()).filter(Boolean)
    : [];
  if (list.length === 0) {
    throw new Error("A IA não retornou sugestões válidas.");
  }
  return list.slice(0, 3);
}

async function askOpenRouterForSuggestions(prompt: string): Promise<string[]> {
  let lastErr: unknown;
  for (const model of openRouterModels()) {
    try {
      const content = await openRouterComplete(
        [{ role: "user", content: prompt }],
        [model],
        { maxTokens: 1024, temperature: 0.7 }
      );
      return parseSuggestions(content);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`A IA reserva não retornou sugestões válidas: ${openRouterErrorMessage(lastErr)}`);
}

export async function askForSuggestions(
  moduleName: string,
  pdfText: string
): Promise<string[]> {
  const prompt = [
    `Você é o professor do módulo "${moduleName}" de elétrica e injeção eletrônica automotiva.`,
    "Com base APENAS no conteúdo abaixo, crie 3 perguntas de estudo curtas (uma frase cada) que um aluno faria para revisar os pontos mais importantes deste módulo.",
    "Varie o estilo entre as perguntas: uma pedindo explicação prática com exemplo de oficina, outra pedindo passo a passo de teste, outra sobre a aplicação de um componente.",
    "Não repita perguntas genéricas como 'o que é isso'. Seja específico do conteúdo.",
    "Responda APENAS com JSON, sem markdown, sem código extra, neste formato:",
    '{"suggestions":["pergunta 1","pergunta 2","pergunta 3"]}',
    "",
    "CONTEÚDO DO MÓDULO:",
    pdfText.slice(0, 60000),
  ].join("\n");

  const errorMsg = (gemErr: unknown, roErr: unknown) =>
    `${geminiErrorMessage(gemErr)} | ${openRouterErrorMessage(roErr)}`;

  if (process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
      const res = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });
      return parseSuggestions(res.text ?? "");
    } catch (gemErr) {
      if (!isOpenRouterConfigured()) throw gemErr;
      try {
        return await askOpenRouterForSuggestions(prompt);
      } catch (roErr) {
        throw new Error(errorMsg(gemErr, roErr));
      }
    }
  }
  if (isOpenRouterConfigured()) return await askOpenRouterForSuggestions(prompt);
  throw new Error("A chave GEMINI_API_KEY não está configurada no .env do servidor.");
}

export async function* streamChatAnswer(
  moduleName: string,
  pdfText: string,
  history: ChatMessage[]
): AsyncGenerator<string> {
  const prompt = buildPrompt(moduleName, pdfText, history);

  const streamOpenRouter = async function* (): AsyncGenerator<string> {
    yield* openRouterStream(
      [{ role: "user", content: prompt }],
      openRouterModels(),
      { maxTokens: 2048, temperature: 0.7 }
    );
  };

  if (process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
      const result = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      // @google/genai retorna um objeto com `.stream`; usa-o, com fallback pro
      // próprio resultado quando ele já for iterável.
      const streamed = result as unknown as {
        stream?: AsyncIterable<GeminiChunk>;
      };
      const iter: AsyncIterable<GeminiChunk> =
        streamed.stream ?? (result as unknown as AsyncIterable<GeminiChunk>);
      for await (const chunk of iter) {
        const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) yield text;
      }
      return;
    } catch (gemErr) {
      if (!isOpenRouterConfigured()) throw gemErr;
      try {
        yield* streamOpenRouter();
      } catch (roErr) {
        throw new Error(
          `${geminiErrorMessage(gemErr)} | ${openRouterErrorMessage(roErr)}`
        );
      }
    }
  } else if (isOpenRouterConfigured()) {
    yield* streamOpenRouter();
  } else {
    throw new Error("A chave GEMINI_API_KEY não está configurada no .env do servidor.");
  }
}

export { geminiErrorMessage, HISTORY_MESSAGES };