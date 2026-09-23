import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "materiais");
const VIDEO_DIR = path.join(process.cwd(), "public", "uploads", "videos");
const AI_CACHE_DIR = path.join(process.cwd(), "public", "uploads", "ia");
const PROMPT_IMAGE_DIR = path.join(process.cwd(), "public", "uploads", "prompts", "images");
const PROMPT_PDF_DIR = path.join(process.cwd(), "public", "uploads", "prompts", "pdfs");

export function buildFileUrl(filename: string): string {
  return `/arquivos/materiais/${filename}`;
}

export function buildVideoUrl(filename: string): string {
  return `/uploads/videos/${filename}`;
}

export function buildPromptImageUrl(filename: string): string {
  return `/api/prompts/assets/${filename}`;
}

export function buildPromptPdfUrl(filename: string): string {
  return `/api/prompts/files/${filename}`;
}

export async function savePdf(file: File): Promise<string> {
  const ext = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "";
  if (ext !== "pdf") {
    throw new Error("Apenas arquivos PDF são aceitos.");
  }
  if (file.size > 100 * 1024 * 1024) {
    throw new Error("O arquivo deve ter no máximo 100MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("O arquivo enviado não é um PDF válido.");
  }
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return buildFileUrl(filename);
}

export async function saveVideo(file: File): Promise<string> {
  const validExts = [".mp4", ".webm", ".ogg", ".mov"];
  const ext = path.extname(file.name).toLowerCase();
  if (!validExts.includes(ext)) {
    throw new Error("Apenas arquivos de vídeo (MP4, WebM, OGG, MOV) são aceitos.");
  }
  if (file.size > 500 * 1024 * 1024) {
    throw new Error("O vídeo deve ter no máximo 500MB.");
  }

  await mkdir(VIDEO_DIR, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(VIDEO_DIR, filename), buffer);

  return buildVideoUrl(filename);
}

export async function savePromptImage(file: File): Promise<string> {
  return savePromptImageBuffer(Buffer.from(await file.arrayBuffer()), file.type);
}

export async function savePromptImageBuffer(buffer: Buffer, fileType: string): Promise<string> {
  const mime = fileType.toLowerCase();
  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  const ext = extensions[mime];
  if (!ext) throw new Error("A imagem deve estar em JPG, PNG ou WebP.");
  if (buffer.length > 10 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 10MB.");
  const validSignature =
    (mime === "image/jpeg" && buffer.subarray(0, 3).toString("hex") === "ffd8ff") ||
    (mime === "image/png" && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") ||
    (mime === "image/webp" && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP");
  if (!validSignature) throw new Error("O arquivo enviado não é uma imagem válida.");

  await mkdir(PROMPT_IMAGE_DIR, { recursive: true });
  const filename = `${randomUUID()}${ext}`;
  await writeFile(path.join(PROMPT_IMAGE_DIR, filename), buffer);
  return buildPromptImageUrl(filename);
}

export async function savePromptPdf(file: File): Promise<string> {
  return savePromptPdfBuffer(Buffer.from(await file.arrayBuffer()));
}

export async function savePromptPdfBuffer(buffer: Buffer): Promise<string> {
  if (buffer.length > 25 * 1024 * 1024) throw new Error("O PDF do prompt deve ter no máximo 25MB.");
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("O arquivo enviado não é um PDF válido.");
  }

  await mkdir(PROMPT_PDF_DIR, { recursive: true });
  const filename = `${randomUUID()}.pdf`;
  await writeFile(path.join(PROMPT_PDF_DIR, filename), buffer);
  return buildPromptPdfUrl(filename);
}

export async function removeFile(fileUrl: string) {
  const name = fileUrl.split("/").pop();
  if (!name) return;
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch {
    // arquivo já não existe
  }
  try {
    await unlink(path.join(AI_CACHE_DIR, `${name}.txt`));
  } catch {
    // cache já não existe
  }
}

export async function removeVideo(fileUrl: string) {
  const name = fileUrl.split("/").pop();
  if (!name) return;
  try {
    await unlink(path.join(VIDEO_DIR, name));
  } catch {
    // arquivo já não existe
  }
}

export async function removePromptAsset(fileUrl: string) {
  const name = fileUrl.split("/").pop();
  if (!name) return;
  const directory = fileUrl.includes("/assets/") ? PROMPT_IMAGE_DIR : PROMPT_PDF_DIR;
  try {
    await unlink(path.join(directory, name));
  } catch {
    // arquivo já não existe
  }
}

export function resolvePromptAsset(fileUrl: string): string {
  const name = fileUrl.split("/").pop() ?? "";
  const directory = fileUrl.includes("/assets/") ? PROMPT_IMAGE_DIR : PROMPT_PDF_DIR;
  return path.join(directory, name);
}

export function resolveFile(fileUrl: string): string {
  const name = fileUrl.split("/").pop();
  return path.join(UPLOAD_DIR, name ?? "");
}
