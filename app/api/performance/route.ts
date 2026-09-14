import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

type AttemptDetail = {
  title: string;
  moduleOrder: number;
  questions: {
    question: string;
    options: { text: string }[];
    correctIndex: number;
    chosenIndex: number | null;
    isCorrect: boolean;
  }[];
};

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const [attempts, studyAgg] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        module: { select: { order: true, name: true } },
      },
    }),
    prisma.studyTime.aggregate({
      where: { userId: user.id },
      _sum: { seconds: true },
    }),
  ]);

  const list = attempts.map((a) => ({
    id: a.id,
    correct: a.correct,
    total: a.total,
    percentage: a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0,
    createdAt: a.createdAt,
    moduleId: a.moduleId,
    moduleOrder: a.module.order,
    moduleName: a.module.name,
    details: a.details as unknown as AttemptDetail,
  }));

  const total = list.length;
  const average =
    total > 0 ? Math.round((list.reduce((s, a) => s + a.correct, 0) / list.reduce((s, a) => s + a.total, 0)) * 100) : 0;

  return NextResponse.json({
    attempts: list,
    summary: {
      attempts: total,
      average,
      studySeconds: studyAgg._sum.seconds ?? 0,
      modulesDone: new Set(list.map((a) => a.moduleId)).size,
      passedModules: new Set(
        list.filter((a) => a.correct >= Math.ceil(a.total / 2)).map((a) => a.moduleId)
      ).size,
    },
  });
}