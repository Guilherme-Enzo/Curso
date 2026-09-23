import path from "node:path";
import { NextResponse } from "next/server";
import { getApiUser, isStaff } from "@/lib/session";
import { PromptPdfError, readPromptAnalysisImage } from "@/lib/promptAnalysis";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const user = await getApiUser();
  if (!user || !isStaff(user)) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { token } = await ctx.params;
  try {
    const image = await readPromptAnalysisImage(token, user.id);
    return new Response(new Uint8Array(image.buffer), {
      headers: {
        "Content-Type": image.mime || `image/${path.extname(token).slice(1)}`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof PromptPdfError ? error.message : "Imagem temporária não encontrada." }, { status: 404 });
  }
}
