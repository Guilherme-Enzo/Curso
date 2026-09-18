import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getApiUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const { id } = await ctx.params;

  const teacher = await prisma.user.findUnique({ where: { id } });
  if (!teacher || teacher.role !== "teacher") {
    return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}