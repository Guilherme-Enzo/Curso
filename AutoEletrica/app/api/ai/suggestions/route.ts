import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";
import { getModuleContent, askForSuggestions, geminiErrorMessage } from "@/lib/aiChat";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const rate = checkRateLimit(`ai-suggestions:${user.id}`, 10, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Limite temporário de sugestões atingido." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId é obrigatório" }, { status: 400 });
  }

  const module = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }
  if (!module.pdfUrl) {
    return NextResponse.json({ error: "Este módulo ainda não possui material em PDF." }, { status: 400 });
  }

  let pdfText: string;
  try {
    pdfText = await getModuleContent(module.pdfUrl);
  } catch (e) {
    return NextResponse.json({ error: geminiErrorMessage(e) }, { status: 400 });
  }

  try {
    const suggestions = await askForSuggestions(module.name, pdfText);
    return NextResponse.json({ suggestions });
  } catch (e) {
    return NextResponse.json({ error: geminiErrorMessage(e) }, { status: 500 });
  }
}
