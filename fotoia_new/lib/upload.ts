import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "materiais");
const VIDEO_DIR = path.join(process.cwd(), "public", "uploads", "videos");

export function buildFileUrl(filename: string): string {
  return `/arquivos/materiais/${filename}`;
}

export function buildVideoUrl(filename: string): string {
  return `/uploads/videos/${filename}`;
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

export async function removeFile(fileUrl: string) {
  const name = fileUrl.split("/").pop();
  if (!name) return;
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch {
    // arquivo já não existe
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

export function resolveFile(fileUrl: string): string {
  const name = fileUrl.split("/").pop();
  return path.join(UPLOAD_DIR, name ?? "");
}