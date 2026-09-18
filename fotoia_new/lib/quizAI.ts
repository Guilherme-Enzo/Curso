import { readFile } from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { resolveFile } from "@/lib/upload";
import {
  isOpenRouterConfigured,
  openRouterComplete,
  openRouterErrorMessage,
  openRouterModels,
} from "@/lib/openrouter";

// Busca direto o modulo para evitar o index.js do pdf-parse v1 (le arquivo de
// teste no load, quebrado no bundle do Next).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  buffer: Buffer
) => Promise<{ text: string }>;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const MAX_TEXT_CHARS = 60000;
const QUIZ_QUESTIONS = 10;

export type ParsedQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type GeneratedQuiz = {
  id: string;
  moduleId: string;
  title: string;
  source: string;
  questionCount: number;
};

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

function buildPrompt(moduleName: string, text: string): string {
  return [
    "Você é um professor de elétrica e injeção eletrônica automotiva.",
    `Com base no conteúdo abaixo, do módulo "${moduleName}" do livro "Fotografia e Edição com IA",`,
    `crie EXATAMENTE ${QUIZ_QUESTIONS} perguntas de múltipla escolha, cada uma com exatamente 4 alternativas.`,
    "As perguntas devem ser objetivas e baseadas somente no texto fornecido, cobrindo os tópicos mais importantes.",
    "",
    "Responda APENAS com um array JSON válido, SEM markdown, SEM blocos de código e SEM texto adicional, neste formato exato:",
    `[{"questionText":"enunciado","options":["A","B","C","D"],"correctIndex":0}]`,
    "",
    "CONTEÚDO:",
    text.slice(0, MAX_TEXT_CHARS),
  ].join("\n");
}

export function parseQuestions(raw: string): ParsedQuestion[] {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```\s*$/, "");

  // Modelos de raciocínio podem prefixar o JSON com "pensamento". Percorre
  // cada posição de "[" até achar um array que parseie de fato.
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
      // tenta a próxima posição de "["
    }
  }
  if (!Array.isArray(list)) {
    throw new Error("A resposta da IA não é um array JSON válido.");
  }

  const questions = list
    .slice(0, QUIZ_QUESTIONS)
    .map((it, idx) => {
      const question = String(it?.questionText ?? "").trim();
      const options = Array.isArray(it?.options)
        ? it.options.map((o: unknown) => String(o ?? "").trim()).filter(Boolean)
        : [];
      if (!question) throw new Error(`Pergunta ${idx + 1} veio sem enunciado.`);
      if (options.length < 2) {
        throw new Error(`Pergunta ${idx + 1} veio sem alternativas válidas.`);
      }
      let correctIndex = Number(it?.correctIndex);
      if (!Number.isInteger(correctIndex)) correctIndex = 0;
      correctIndex = Math.min(Math.max(correctIndex, 0), options.length - 1);
      return { question, options, correctIndex };
    })
    .filter((q: ParsedQuestion) => q.question.length > 0);

  if (questions.length === 0) {
    throw new Error("A IA não retornou nenhuma pergunta válida.");
  }
  return questions;
}

async function extractPdfText(pdfUrl: string): Promise<string> {
  const data = await readFile(resolveFile(pdfUrl));
  const parsed = await pdfParse(data);
  const text = (parsed.text ?? "").trim();
  if (!text) {
    throw new Error("Não foi possível extrair texto do PDF (pode ser um PDF escaneado, sem camada de texto).");
  }
  return text;
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

export async function askGeminiForQuiz(moduleName: string, pdfText: string): Promise<ParsedQuestion[]> {
  if (!isGeminiConfigured()) {
    throw new Error("A chave GEMINI_API_KEY não está configurada no .env do servidor.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  try {
    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(moduleName, pdfText),
    });
    const raw = res.text ?? "";
    if (!raw) {
      throw new Error("O Gemini não retornou nenhum conteúdo.");
    }
    return parseQuestions(raw);
  } catch (e) {
    throw new Error(`Erro na geração do quiz: ${geminiErrorMessage(e)}`);
  }
}

async function askOpenRouterForQuiz(moduleName: string, pdfText: string): Promise<ParsedQuestion[]> {
  const prompt = buildPrompt(moduleName, pdfText);
  let lastErr: unknown;
  for (const model of openRouterModels()) {
    try {
      const content = await openRouterComplete(
        [{ role: "user", content: prompt }],
        [model],
        { maxTokens: 4096, temperature: 0.7 }
      );
      return parseQuestions(content);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`O quiz não pôde ser gerado pela IA reserva: ${openRouterErrorMessage(lastErr)}`);
}

export async function askQuiz(moduleName: string, pdfText: string): Promise<ParsedQuestion[]> {
  const fallbackErr =
    "A IA principal falhou. A IA reserva também não respondeu; confira as chaves no .env.";
  if (isGeminiConfigured()) {
    try {
      return await askGeminiForQuiz(moduleName, pdfText);
    } catch (gemErr) {
      if (!isOpenRouterConfigured()) throw gemErr;
      try {
        return await askOpenRouterForQuiz(moduleName, pdfText);
      } catch (roErr) {
        throw new Error(`${geminiErrorMessage(gemErr)} | ${openRouterErrorMessage(roErr)}`);
      }
    }
  }
  if (isOpenRouterConfigured()) {
    try {
      return await askOpenRouterForQuiz(moduleName, pdfText);
    } catch (roErr) {
      throw new Error(openRouterErrorMessage(roErr));
    }
  }
  throw new Error(fallbackErr);
}

export async function generateModuleQuiz(moduleId: string): Promise<GeneratedQuiz> {
  const module = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module) throw new Error("Módulo não encontrado.");
  if (!module.pdfUrl) throw new Error("Este módulo não possui PDF para gerar o quiz.");

  const questions = await askQuiz(module.name, await extractPdfText(module.pdfUrl));

  const title = `Avaliação IA — ${module.name}`;
  const [, created] = await prisma.$transaction([
    prisma.quiz.deleteMany({ where: { moduleId: module.id } }),
    prisma.quiz.create({
      data: {
        moduleId: module.id,
        title,
        source: "ia",
        questions: {
          create: questions.map((q, i) => ({
            order: i,
            question: q.question,
            correctIndex: q.correctIndex,
            options: { create: q.options.map((text, oi) => ({ order: oi, text })) },
          })),
        },
      },
    }),
  ]);

  return {
    id: created.id,
    moduleId: created.moduleId,
    title: created.title,
    source: created.source,
    questionCount: questions.length,
  };
}