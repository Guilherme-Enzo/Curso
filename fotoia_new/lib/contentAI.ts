import { readFile } from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import pdfParse from "pdf-parse";
import { prisma } from "@/lib/prisma";
import { resolveFile } from "@/lib/upload";
import {
  isOpenRouterConfigured,
  openRouterComplete,
  openRouterErrorMessage,
  openRouterModels,
} from "@/lib/openrouter";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const MAX_TEXT_CHARS = 60000;

export type SubmoduleContent = {
  title: string;
  content: string;
  images: string[];
};

export type GeneratedContent = {
  icon: string;
  tag: string;
  summary: string;
  submodules: SubmoduleContent[];
};

function buildSynopsisPrompt(moduleName: string, text: string): string {
  return [
    "Você é um colaborador de fotografia, edição e criação de imagens com inteligência artificial.",
    `Com base no conteúdo abaixo, do módulo "${moduleName}" do livro "Fotografia e Edição com IA",`,
    "escreva uma sinopse curta (3 a 5 frases) explicando o que o usuário vai estudar neste módulo.",
    "A sinopse deve ser objetiva, indicando os principais tópicos abordados no PDF.",
    "Não use markdown, não use formatação. Apenas texto corrido.",
    "",
    "CONTEÚDO:",
    text.slice(0, MAX_TEXT_CHARS),
  ].join("\n");
}

function buildDescriptionPrompt(moduleName: string, text: string): string {
  return [
    "Você é um colaborador de fotografia, edição e criação de imagens com inteligência artificial.",
    `Com base no conteúdo abaixo, do módulo "${moduleName}", gere uma DESCRICAO do módulo.`,
    "A descrição deve ser uma lista dos tópicos que serão estudados, separados por vírgula.",
    "Exemplo: composição, iluminação, direção de arte, Midjourney, DALL-E e Stable Diffusion",
    "",
    "Regras:",
    "- Extraia os tópicos principais do PDF",
    "- Separe cada tópico por vírgula",
    "- NÃO use números, nem pontos, nem formatação",
    "- Não invente tópicos, use apenas o que está no conteúdo",
    "",
    "CONTEÚDO:",
    text.slice(0, MAX_TEXT_CHARS),
  ].join("\n");
}

function buildContentPrompt(moduleName: string, text: string): string {
  return [
    "Você é um colaborador de fotografia, edição e criação de imagens com inteligência artificial.",
    `Com base no conteúdo abaixo, do módulo "${moduleName}" do livro "Fotografia e Edição com IA",`,
    "gere uma estrutura de conteúdo didático para estudantes.",
    "",
    "Responda APENAS com um array JSON válido, SEM markdown, SEM blocos de código e SEM texto adicional, neste formato exato:",
    '[{"title":"Título do Submódulo","content":"Conteúdo explicativo em parágrafos separados por \\n"}]',
    "",
    "Regras:",
    "- Crie entre 3 e 8 submódulos, organizados do mais básico ao mais avançado",
    "- Cada submódulo deve ter um título curto e descritivo",
    "- O conteúdo de cada submódulo deve ser explicativo, didático, com parágrafos separados por \\n",
    "- Use linguagem acessível, como se estivesse explicando para um usuário",
    "- Não invente informações, use apenas o conteúdo do PDF fornecido",
    "- Não inclua campo 'images' no JSON",
    "",
    "CONTEÚDO:",
    text.slice(0, MAX_TEXT_CHARS),
  ].join("\n");
}

function parseContent(raw: string): GeneratedContent {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```\s*$/, "");

  // Find JSON array
  let list: unknown = null;
  const starts: number[] = [];
  for (let i = cleaned.indexOf("["); i !== -1; i = cleaned.indexOf("[", i + 1)) {
    starts.push(i);
  }
  for (const start of starts) {
    const end = cleaned.lastIndexOf("]");
    if (end <= start) break;
    try {
      const candidate = JSON.parse(cleaned.slice(start, end + 1));
      if (Array.isArray(candidate)) {
        list = candidate;
        break;
      }
    } catch {
      // try next position
    }
  }
  if (!Array.isArray(list)) {
    throw new Error("A resposta da IA não é um array JSON válido.");
  }

  const submodules: SubmoduleContent[] = list
    .slice(0, 8)
    .map((it) => {
      const title = String(it?.title ?? "").trim();
      const content = String(it?.content ?? "").trim();
      if (!title || !content) return null;
      return { title, content, images: [] as string[] };
    })
    .filter((s): s is SubmoduleContent => s !== null);

  if (submodules.length === 0) {
    throw new Error("A IA não gerou nenhum submódulo válido.");
  }

  // Build summary from first submodule title or combined content
  const summary = submodules
    .slice(0, 3)
    .map((s) => s.title)
    .join(", ");

  return {
    icon: "📘",
    tag: "Conteúdo IA",
    summary,
    submodules,
  };
}

function geminiErrorMessage(err: unknown): string {
  let candidate = err instanceof Error ? err.message : String(err ?? "Erro na chamada à IA.");
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

async function extractPdfText(pdfUrl: string): Promise<string> {
  const data = await readFile(resolveFile(pdfUrl));
  const parsed = await pdfParse(data);
  const text = (parsed.text ?? "").trim();
  if (!text) {
    throw new Error("Não foi possível extrair texto do PDF.");
  }
  return text;
}

async function askGeminiForContent(moduleName: string, pdfText: string): Promise<GeneratedContent> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("A chave GEMINI_API_KEY não está configurada no .env do servidor.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  try {
    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildContentPrompt(moduleName, pdfText),
    });
    const raw = res.text ?? "";
    if (!raw) {
      throw new Error("O Gemini não retornou nenhum conteúdo.");
    }
    return parseContent(raw);
  } catch (e) {
    throw new Error(`Erro na geração do conteúdo: ${geminiErrorMessage(e)}`);
  }
}

async function askOpenRouterForContent(moduleName: string, pdfText: string): Promise<GeneratedContent> {
  const prompt = buildContentPrompt(moduleName, pdfText);
  let lastErr: unknown;
  for (const model of openRouterModels()) {
    try {
      const content = await openRouterComplete(
        [{ role: "user", content: prompt }],
        [model],
        { maxTokens: 4096, temperature: 0.7 }
      );
      return parseContent(content);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`O conteúdo não pôde ser gerado pela IA reserva: ${openRouterErrorMessage(lastErr)}`);
}

async function askForContent(moduleName: string, pdfText: string): Promise<GeneratedContent> {
  const fallbackErr =
    "A IA principal falhou. A IA reserva também não respondeu; confira as chaves no .env.";
  if (process.env.GEMINI_API_KEY) {
    try {
      return await askGeminiForContent(moduleName, pdfText);
    } catch (gemErr) {
      if (!isOpenRouterConfigured()) throw gemErr;
      try {
        return await askOpenRouterForContent(moduleName, pdfText);
      } catch (roErr) {
        throw new Error(`${geminiErrorMessage(gemErr)} | ${openRouterErrorMessage(roErr)}`);
      }
    }
  }
  if (isOpenRouterConfigured()) {
    try {
      return await askOpenRouterForContent(moduleName, pdfText);
    } catch (roErr) {
      throw new Error(openRouterErrorMessage(roErr));
    }
  }
  throw new Error(fallbackErr);
}

async function askGeminiForSynopsis(moduleName: string, pdfText: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const res = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildSynopsisPrompt(moduleName, pdfText),
  });
  const raw = (res.text ?? "").trim();
  if (!raw) throw new Error("Gemini não retornou sinopse.");
  return raw;
}

async function askOpenRouterForSynopsis(moduleName: string, pdfText: string): Promise<string> {
  const prompt = buildSynopsisPrompt(moduleName, pdfText);
  let lastErr: unknown;
  for (const model of openRouterModels()) {
    try {
      return await openRouterComplete(
        [{ role: "user", content: prompt }],
        [model],
        { maxTokens: 1024, temperature: 0.7 }
      );
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Sinopse não pôde ser gerada: ${openRouterErrorMessage(lastErr)}`);
}

async function askForSynopsis(moduleName: string, pdfText: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await askGeminiForSynopsis(moduleName, pdfText);
    } catch (gemErr) {
      if (!isOpenRouterConfigured()) throw gemErr;
      try {
        return await askOpenRouterForSynopsis(moduleName, pdfText);
      } catch (roErr) {
        throw new Error(`${geminiErrorMessage(gemErr)} | ${openRouterErrorMessage(roErr)}`);
      }
    }
  }
  if (isOpenRouterConfigured()) {
    try {
      return await askOpenRouterForSynopsis(moduleName, pdfText);
    } catch (roErr) {
      throw new Error(openRouterErrorMessage(roErr));
    }
  }
  throw new Error("Nenhuma IA configurada para gerar sinopse.");
}

async function askGeminiForDescription(moduleName: string, pdfText: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const res = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildDescriptionPrompt(moduleName, pdfText),
  });
  const raw = (res.text ?? "").trim();
  if (!raw) throw new Error("Gemini não retornou descrição.");
  return raw;
}

async function askOpenRouterForDescription(moduleName: string, pdfText: string): Promise<string> {
  const prompt = buildDescriptionPrompt(moduleName, pdfText);
  let lastErr: unknown;
  for (const model of openRouterModels()) {
    try {
      return await openRouterComplete(
        [{ role: "user", content: prompt }],
        [model],
        { maxTokens: 1024, temperature: 0.7 }
      );
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Descrição não pôde ser gerada: ${openRouterErrorMessage(lastErr)}`);
}

async function askForDescription(moduleName: string, pdfText: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      return await askGeminiForDescription(moduleName, pdfText);
    } catch (gemErr) {
      if (!isOpenRouterConfigured()) throw gemErr;
      try {
        return await askOpenRouterForDescription(moduleName, pdfText);
      } catch (roErr) {
        throw new Error(`${geminiErrorMessage(gemErr)} | ${openRouterErrorMessage(roErr)}`);
      }
    }
  }
  if (isOpenRouterConfigured()) {
    try {
      return await askOpenRouterForDescription(moduleName, pdfText);
    } catch (roErr) {
      throw new Error(openRouterErrorMessage(roErr));
    }
  }
  throw new Error("Nenhuma IA configurada para gerar descrição.");
}

/**
 * Generate content (submodules) + synopsis + description from a module's PDF and store in DB.
 */
export async function generateModuleContent(
  moduleId: string,
  moduleName: string,
  pdfUrl: string,
  hasDescription: boolean = false
): Promise<{ content: GeneratedContent | null; synopsis: string | null; description: string | null; aiError: string | null }> {
  try {
    const pdfText = await extractPdfText(pdfUrl);

    // Synopsis and content always generated; description only if user didn't provide one
    const [content, synopsis, description] = await Promise.all([
      askForContent(moduleName, pdfText).catch(() => null),
      askForSynopsis(moduleName, pdfText).catch(() => null),
      hasDescription ? Promise.resolve(null) : askForDescription(moduleName, pdfText).catch(() => null),
    ]);

    // Store in DB
    await prisma.module.update({
      where: { id: moduleId },
      data: {
        content: content ? JSON.stringify(content) : undefined,
        synopsis: synopsis ?? undefined,
        description: description ?? undefined,
      },
    });

    return { content, synopsis, description, aiError: null };
  } catch (e) {
    const aiError = e instanceof Error ? e.message : "Erro ao gerar conteúdo com IA";
    return { content: null, synopsis: null, description: null, aiError };
  }
}

/**
 * Parse stored content JSON from DB into GeneratedContent.
 */
export function parseStoredContent(raw: string | null): GeneratedContent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.submodules)) {
      return parsed as GeneratedContent;
    }
  } catch {
    // invalid JSON
  }
  return null;
}
