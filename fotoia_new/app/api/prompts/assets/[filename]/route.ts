import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess } from "@/lib/session";
import { buildPromptImageUrl, resolvePromptAsset } from "@/lib/upload";

const mimeTypes: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function GET(_req: Request, ctx: { params: Promise<{ filename: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { filename } = await ctx.params;
  const safe = path.basename(filename);
  const imageUrl = buildPromptImageUrl(safe);
  const prompt = await prisma.prompt.findFirst({ where: { imageUrl } });
  if (!prompt) return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  if (!prompt.isFree && !hasFullAccess(user)) return NextResponse.json({ error: "Este prompt exige o plano FULL" }, { status: 403 });
  try {
    const data = await readFile(resolvePromptAsset(imageUrl));
    return new Response(data, { headers: { "Content-Type": mimeTypes[path.extname(safe).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "private, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }
}
