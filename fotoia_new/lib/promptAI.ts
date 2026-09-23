import { GoogleGenAI } from "@google/genai";
import pdfParse from "pdf-parse";
import {
  isOpenRouterConfigured,
  openRouterComplete,
  openRouterErrorMessage,
  openRouterModels,
} from "@/lib/openrouter";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const MAX_TEXT_CHARS = 60000;

export async function extractPromptText(buffer: Buffer): Promise<string> {
  const parsed = await pdfParse(buffer);
  const text = String(parsed.text ?? "").trim();
  if (!text) throw new Error("Não foi possível ler o texto do prompt no PDF.");
  return text.slice(0, MAX_TEXT_CHARS);
}

export type CompletedPromptFields = {
  name: string;
  description: string;
};

function completionInstruction(promptText: string, name: string, description: string): string {
  return [
    "Você é um especialista em prompts para edição e criação de imagens.",
    "Complete somente os campos que estiverem vazios usando exclusivamente o texto do prompt abaixo.",
    "Não analise nem invente informações sobre uma imagem.",
    "Retorne somente JSON válido, sem markdown, neste formato:",
    '{"name":"nome curto do prompt","description":"descrição objetiva em até 3 frases"}',
    `Nome atual: ${name || "(vazio)"}`,
    `Descrição atual: ${description || "(vazia)"}`,
    "Prompt:",
    promptText.slice(0, MAX_TEXT_CHARS),
  ].join("\n");
}

function parseFields(value: string): CompletedPromptFields {
  const cleaned = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("A IA não retornou os campos do prompt em formato válido.");
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  const name = String(parsed.name ?? "").trim().slice(0, 160);
  const description = String(parsed.description ?? "").trim().slice(0, 1200);
  if (!name || !description) throw new Error("A IA não conseguiu completar nome e descrição do prompt.");
  return { name, description };
}

async function completeWithGemini(instruction: string): Promise<CompletedPromptFields> {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não configurada.");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: instruction }] }],
  });
  return parseFields(response.text ?? "");
}

async function completeWithOpenRouter(instruction: string): Promise<CompletedPromptFields> {
  let lastError: unknown;
  for (const model of openRouterModels()) {
    try {
      const result = await openRouterComplete(
        [{ role: "user", content: instruction }],
        [model],
        { maxTokens: 500, temperature: 0.2 },
      );
      return parseFields(result);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(openRouterErrorMessage(lastError));
}

export async function completePromptFields(input: {
  promptText: string;
  name?: string;
  description?: string;
}): Promise<CompletedPromptFields> {
  const name = input.name?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  if (name && description) return { name: name.slice(0, 160), description: description.slice(0, 1200) };

  const instruction = completionInstruction(input.promptText, name, description);
  let generated: CompletedPromptFields;
  if (process.env.GEMINI_API_KEY) {
    try {
      generated = await completeWithGemini(instruction);
    } catch (geminiError) {
      if (!isOpenRouterConfigured()) throw geminiError;
      try {
        generated = await completeWithOpenRouter(instruction);
      } catch (fallbackError) {
        throw new Error(`${geminiError instanceof Error ? geminiError.message : "Falha na IA principal."} | ${openRouterErrorMessage(fallbackError)}`);
      }
    }
  } else if (isOpenRouterConfigured()) {
    generated = await completeWithOpenRouter(instruction);
  } else {
    throw new Error("Configure GEMINI_API_KEY ou OPENROUTER_API_KEY para completar os campos automaticamente.");
  }

  return {
    name: name || generated.name,
    description: description || generated.description,
  };
}
