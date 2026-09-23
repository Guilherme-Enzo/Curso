import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const where = isStaff(user) ? {} : { userId: user.id };

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
      answeredBy: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { questionText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const questionText = String(body.questionText ?? "").trim();
  if (!questionText || questionText.length < 5) {
    return NextResponse.json(
      { error: "Descreva a dúvida (mínimo 5 caracteres)" },
      { status: 400 }
    );
  }
  if (questionText.length > 4000) {
    return NextResponse.json({ error: "A dúvida deve ter no máximo 4000 caracteres" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: { userId: user.id, questionText },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ question }, { status: 201 });
}
