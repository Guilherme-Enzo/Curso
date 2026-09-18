import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET() {
  const user = await getApiUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const [students, teachers, modules, openQuestions, answeredQuestions, quizzes] =
    await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "teacher" } }),
      prisma.module.count(),
      prisma.question.count({ where: { status: "open" } }),
      prisma.question.count({ where: { status: "answered" } }),
      prisma.quiz.count(),
    ]);

  return NextResponse.json({
    stats: {
      students,
      teachers,
      modules,
      openQuestions,
      answeredQuestions,
      quizzes,
    },
  });
}