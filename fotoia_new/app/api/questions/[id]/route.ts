import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Apenas colaboradores e admin podem responder" }, { status: 403 });
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
  if (answerText.length > 4000) {
    return NextResponse.json({ error: "A resposta deve ter no máximo 4000 caracteres" }, { status: 400 });
  }

  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Dúvida não encontrada" }, { status: 404 });
  }

  const question = await prisma.question.update({
    where: { id },
    data: { answerText, status: "answered", answeredById: user.id, answeredAt: new Date() },
    include: {
      user: { select: { id: true, name: true } },
      answeredBy: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json({ question });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const question = await prisma.question.findUnique({ where: { id }, select: { userId: true } });
  if (!question) {
    return NextResponse.json({ error: "Dúvida não encontrada" }, { status: 404 });
  }
  if (question.userId !== user.id) {
    return NextResponse.json({ error: "Você só pode excluir suas próprias dúvidas" }, { status: 403 });
  }

  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
