import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { completePromptFields, extractPromptText } from "@/lib/promptAI";

const execFileAsync = promisify(execFile);
const ANALYSIS_ROOT = path.join(os.tmpdir(), "fotoia-prompt-analysis");
const ANALYSIS_TTL_MS = 20 * 60 * 1000;
const MAX_PDF_SIZE = 25 * 1024 * 1024;

export class PromptPdfError extends Error {
  constructor(message: string, public readonly missing: string[] = []) {
    super(message);
    this.name = "PromptPdfError";
  }
}

export type PromptPdfAnalysis = {
  token: string;
  name: string;
  description: string;
  promptText: string;
  imageUrl: string;
};

type AnalysisSession = {
  userId: string;
  expiresAt: number;
  name: string;
  description: string;
  promptText: string;
  imageFile: string;
  imageMime: string;
  pdfHash: string;
};

function safeToken(token: string): string {
  if (!/^[a-f0-9-]{36}$/.test(token)) throw new PromptPdfError("Análise do PDF inválida.");
  return token;
}

function analysisDirectory(token: string): string {
  return path.join(ANALYSIS_ROOT, safeToken(token));
}

function promptParts(text: string): { name: string; description: string; promptText: string } {
  const normalized = text.replace(/\r/g, "").trim();
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const promptMatch = normalized.match(/(?:^|\n)\s*(?:PROMPT\s+PARA\s+IA|TEXTO\s+DO\s+PROMPT|PROMPT)\s*:?\s*/i);
  if (!promptMatch || promptMatch.index === undefined) {
    throw new PromptPdfError("Está faltando o prompt no PDF.", ["prompt"]);
  }

  const beforePrompt = normalized.slice(0, promptMatch.index).trim();
  const promptText = normalized.slice(promptMatch.index + promptMatch[0].length).trim();
  if (!promptText) throw new PromptPdfError("Está faltando o prompt no PDF.", ["prompt"]);

  const titleLine = lines.find((line) => /^(?:t[ií]tulo|nome)\s*:/i.test(line));
  const name = (titleLine?.replace(/^(?:t[ií]tulo|nome)\s*:\s*/i, "") || lines[0] || "").trim();
  const descriptionLines = beforePrompt
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^(?:t[ií]tulo|nome)\s*:/i.test(line))
    .filter((line) => !/^(?:descri[cç][aã]o|description)\s*:/i.test(line));
  if (!titleLine && descriptionLines[0] === name) descriptionLines.shift();
  const labeledDescription = beforePrompt.match(/(?:descri[cç][aã]o|description)\s*:\s*([\s\S]*?)(?=\n\s*(?:PROMPT|TEXTO\s+DO\s+PROMPT)\b|$)/i)?.[1]?.trim();
  const description = (labeledDescription || descriptionLines.join(" ")).trim();

  return {
    name: name.slice(0, 160),
    description: description.slice(0, 1200),
    promptText: promptText.slice(0, 60000),
  };
}

async function extractImage(pdfBuffer: Buffer, directory: string): Promise<{ buffer: Buffer; mime: string; filename: string }> {
  const pdfPath = path.join(directory, "source.pdf");
  const prefix = path.join(directory, "image");
  await writeFile(pdfPath, pdfBuffer);
  try {
    await execFileAsync("pdfimages", ["-png", pdfPath, prefix], { timeout: 20000, maxBuffer: 1024 * 1024 });
  } catch {
    throw new PromptPdfError("Está faltando a foto no PDF.", ["foto"]);
  }
  const files = await readdir(directory);
  const candidates = files.filter((file) => /^image-\d+\.(?:png|jpg|jpeg|webp)$/i.test(file));
  if (!candidates.length) throw new PromptPdfError("Está faltando a foto no PDF.", ["foto"]);
  const withSizes = await Promise.all(candidates.map(async (file) => ({ file, size: (await stat(path.join(directory, file))).size })));
  const selected = withSizes.sort((a, b) => b.size - a.size)[0].file;
  const extension = path.extname(selected).toLowerCase();
  const mime = extension === ".jpg" || extension === ".jpeg" ? "image/jpeg" : "image/png";
  return { buffer: await readFile(path.join(directory, selected)), mime, filename: "image" + extension };
}

async function removeExpiredAnalyses() {
  try {
    const entries = await readdir(ANALYSIS_ROOT, { withFileTypes: true });
    await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
      try {
        const data = JSON.parse(await readFile(path.join(ANALYSIS_ROOT, entry.name, "data.json"), "utf8")) as AnalysisSession;
        if (data.expiresAt < Date.now()) await rm(path.join(ANALYSIS_ROOT, entry.name), { recursive: true, force: true });
      } catch {
        // Uma análise incompleta pode ser removida sem afetar as demais.
      }
    }));
  } catch {
    // O diretório ainda pode não existir na primeira análise.
  }
}

export async function createPromptAnalysis(userId: string, pdfBuffer: Buffer): Promise<PromptPdfAnalysis> {
  if (pdfBuffer.length > MAX_PDF_SIZE) throw new PromptPdfError("O PDF do prompt deve ter no máximo 25MB.");
  if (pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") throw new PromptPdfError("O arquivo enviado não é um PDF válido.");
  await removeExpiredAnalyses();
  await mkdir(ANALYSIS_ROOT, { recursive: true });
  const token = randomUUID();
  const directory = analysisDirectory(token);
  await mkdir(directory, { recursive: true });
  try {
    const text = await extractPromptText(pdfBuffer).catch(() => {
      throw new PromptPdfError("Está faltando o prompt no PDF.", ["prompt"]);
    });
    const parts = promptParts(text);
    const image = await extractImage(pdfBuffer, directory);
    const completed = await completePromptFields(parts);
    const session: AnalysisSession = {
      userId,
      expiresAt: Date.now() + ANALYSIS_TTL_MS,
      name: completed.name,
      description: completed.description,
      promptText: parts.promptText,
      imageFile: image.filename,
      imageMime: image.mime,
      pdfHash: createHash("sha256").update(pdfBuffer).digest("hex"),
    };
    await writeFile(path.join(directory, image.filename), image.buffer);
    await writeFile(path.join(directory, "data.json"), JSON.stringify(session), "utf8");
    return {
      token,
      name: completed.name,
      description: completed.description,
      promptText: parts.promptText,
      imageUrl: `/api/prompts/analysis/${token}/image`,
    };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

export async function readPromptAnalysis(token: string, userId: string): Promise<{ session: AnalysisSession; directory: string }> {
  const directory = analysisDirectory(token);
  try {
    const session = JSON.parse(await readFile(path.join(directory, "data.json"), "utf8")) as AnalysisSession;
    if (session.userId !== userId) throw new PromptPdfError("Análise do PDF não pertence a este usuário.");
    if (session.expiresAt < Date.now()) {
      await rm(directory, { recursive: true, force: true });
      throw new PromptPdfError("A análise do PDF expirou. Envie o PDF novamente.");
    }
    return { session, directory };
  } catch (error) {
    if (error instanceof PromptPdfError) throw error;
    throw new PromptPdfError("A análise do PDF não está mais disponível. Envie o PDF novamente.");
  }
}

export async function readPromptAnalysisImage(token: string, userId: string): Promise<{ buffer: Buffer; mime: string }> {
  const { session, directory } = await readPromptAnalysis(token, userId);
  return { buffer: await readFile(path.join(directory, session.imageFile)), mime: session.imageMime };
}

export async function removePromptAnalysis(token: string): Promise<void> {
  try {
    await rm(analysisDirectory(token), { recursive: true, force: true });
  } catch {
    // A análise temporária já pode ter expirado.
  }
}
