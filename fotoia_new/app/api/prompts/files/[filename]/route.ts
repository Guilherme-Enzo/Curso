import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess } from "@/lib/session";
import { buildPromptPdfUrl, resolvePromptAsset } from "@/lib/upload";

function downloadName(promptName: string): string {
  return promptName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "prompt";
}

export async function GET(_req: Request, ctx: { params: Promise<{ filename: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { filename } = await ctx.params;
  const safe = path.basename(filename);
  const pdfUrl = buildPromptPdfUrl(safe);
  const prompt = await prisma.prompt.findFirst({ where: { pdfUrl } });
  if (!prompt) return NextResponse.json({ error: "PDF não encontrado" }, { status: 404 });
  if (!prompt.isFree && !hasFullAccess(user)) return NextResponse.json({ error: "Este prompt exige o plano FULL" }, { status: 403 });
  try {
    const data = await readFile(resolvePromptAsset(pdfUrl));
    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadName(prompt.name)}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "PDF não encontrado" }, { status: 404 });
  }
}
