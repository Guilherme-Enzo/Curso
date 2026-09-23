import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET() {
  const user = await getApiUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const [students, fullStudents, teachers, modules, prompts, openQuestions, answeredQuestions, usersWithBirthDate, studentsWithGender] =
    await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "student", plan: "FULL" } }),
      prisma.user.count({ where: { role: "teacher" } }),
      prisma.module.count(),
      prisma.prompt.count(),
      prisma.question.count({ where: { status: "open" } }),
      prisma.question.count({ where: { status: "answered" } }),
      prisma.user.findMany({ where: { birthDate: { not: null } }, select: { birthDate: true } }),
      prisma.user.findMany({ where: { role: "student" }, select: { gender: true } }),
    ]);

  const today = new Date();
  const calculatedAges: number[] = [];
  for (const user of usersWithBirthDate) {
    if (!user.birthDate) continue;
    const birthDate = new Date(user.birthDate);
    const age = today.getFullYear() - birthDate.getFullYear() - (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
        ? 1
        : 0
    );
    if (age >= 0) calculatedAges.push(age);
  }
  const ageDistribution = Array.from(
    { length: Math.max(...calculatedAges, 0) + 1 },
    () => 0,
  );
  for (const age of calculatedAges) ageDistribution[age] += 1;

  const genderDistribution = { male: 0, female: 0, other: 0, prefer_not_to_say: 0, not_informed: 0 };
  for (const student of studentsWithGender) {
    if (student.gender === "male" || student.gender === "female" || student.gender === "other" || student.gender === "prefer_not_to_say") {
      genderDistribution[student.gender] += 1;
    } else {
      genderDistribution.not_informed += 1;
    }
  }

  return NextResponse.json({
    stats: {
      students,
      fullStudents,
      teachers,
      modules,
      prompts,
      openQuestions,
      answeredQuestions,
      ageDistribution,
      genderDistribution,
    },
  });
}
