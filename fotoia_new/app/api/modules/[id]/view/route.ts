import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess, isStaff } from "@/lib/session";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await ctx.params;
  const module = await prisma.module.findUnique({ where: { id }, select: { id: true, isFree: true } });
  if (!module) return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });
  if (!module.isFree && !hasFullAccess(user) && !isStaff(user)) return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });

  await prisma.moduleView.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId: id } },
    create: { userId: user.id, moduleId: id },
    update: { viewedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
