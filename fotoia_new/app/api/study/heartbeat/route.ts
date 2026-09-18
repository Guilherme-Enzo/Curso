import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { moduleId?: string; seconds?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const moduleId = typeof body.moduleId === "string" ? body.moduleId : "";
  const seconds = Math.min(Math.max(Math.floor(body.seconds ?? 60), 1), 600);
  if (!moduleId) {
    return NextResponse.json({ error: "Módulo inválido" }, { status: 400 });
  }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true },
  });
  if (!module) {
    return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });
  }

  const existing = await prisma.studyTime.findUnique({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    select: { seconds: true, updatedAt: true },
  });

  const recentlyCounted =
    existing && Date.now() - existing.updatedAt.getTime() < 30_000;
  if (recentlyCounted) {
    return NextResponse.json({ counted: 0 });
  }

  await prisma.studyTime.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    create: { userId: user.id, moduleId, seconds },
    update: { seconds: { increment: seconds } },
  });

  return NextResponse.json({ counted: seconds });
}