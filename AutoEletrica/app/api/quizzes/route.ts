import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleOrder = Number(searchParams.get("moduleOrder"));

  const quizzes = await prisma.quiz.findMany({
    where: moduleOrder ? { module: { order: moduleOrder } } : undefined,
    orderBy: { module: { order: "asc" } },
    select: {
      id: true,
      title: true,
      source: true,
      module: { select: { order: true, name: true } },
      questions: { select: { id: true } },
    },
  });

  return NextResponse.json({
    quizzes: quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      source: q.source,
      moduleOrder: q.module.order,
      moduleName: q.module.name,
      questionCount: q.questions.length,
    })),
  });
}