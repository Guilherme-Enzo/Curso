import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { generateModuleQuiz } from "@/lib/quizAI";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Apenas professores e admin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const module = await prisma.module.findUnique({ where: { id } });
  if (!module) {
    return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });
  }
  if (!module.pdfUrl) {
    return NextResponse.json(
      { error: "Este módulo não possui PDF para gerar o quiz." },
      { status: 400 }
    );
  }

  try {
    const quiz = await generateModuleQuiz(id);
    return NextResponse.json({ quiz });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao gerar quiz com IA";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}