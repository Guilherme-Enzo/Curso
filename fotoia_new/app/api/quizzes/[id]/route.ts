import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      module: { select: { order: true, name: true } },
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    quiz: { ...quiz, moduleOrder: quiz.module.order },
  });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { answers?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      module: { select: { id: true, order: true, name: true } },
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz não encontrado" }, { status: 404 });
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];
  const questions = quiz.questions;
  let correct = 0;

  const results = questions.map((q, i) => {
    const chosen = typeof answers[i] === "number" ? answers[i] : null;
    const isCorrect = chosen === q.correctIndex;
    if (isCorrect) correct++;
    return { questionId: q.id, correctIndex: q.correctIndex, chosen, isCorrect };
  });

  const details = {
    title: quiz.title,
    moduleOrder: quiz.module.order,
    questions: questions.map((q, i) => ({
      questionId: q.id,
      question: q.question,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      correctIndex: q.correctIndex,
      chosenIndex: typeof answers[i] === "number" ? answers[i] : null,
      isCorrect: answers[i] === q.correctIndex,
    })),
  };

  await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId: quiz.id,
      moduleId: quiz.moduleId,
      details: details as object,
      correct,
      total: questions.length,
    },
  });

  return NextResponse.json({ total: questions.length, correct, results });
}