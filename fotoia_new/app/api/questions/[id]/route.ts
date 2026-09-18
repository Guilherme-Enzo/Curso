import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Apenas professores e admin podem responder" }, { status: 403 });
  }

  const { id } = await ctx.params;

  let body: { answerText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const answerText = String(body.answerText ?? "").trim();
  if (!answerText || answerText.length < 5) {
    return NextResponse.json(
      { error: "Escreva a resposta (mínimo 5 caracteres)" },
      { status: 400 }
    );
  }

  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Dúvida não encontrada" }, { status: 404 });
  }

  const question = await prisma.question.update({
    where: { id },
    data: { answerText, status: "answered" },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ question });
}