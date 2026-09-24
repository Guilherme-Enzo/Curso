import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess } from "@/lib/session";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await ctx.params;
  const prompt = await prisma.prompt.findUnique({ where: { id }, select: { id: true, isFree: true } });
  if (!prompt) return NextResponse.json({ error: "Prompt não encontrado" }, { status: 404 });
  if (!prompt.isFree && !hasFullAccess(user)) return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });

  await prisma.promptView.upsert({
    where: { userId_promptId: { userId: user.id, promptId: id } },
    create: { userId: user.id, promptId: id },
    update: { viewedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
