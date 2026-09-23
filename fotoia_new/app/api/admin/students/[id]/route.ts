import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getApiUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const plan = body?.plan;
  if (plan !== "FREE" && plan !== "FULL") {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({ where: { id } });
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { plan },
    select: { id: true, name: true, email: true, birthDate: true, createdAt: true, plan: true },
  });
  return NextResponse.json({ student: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getApiUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const { id } = await ctx.params;

  const student = await prisma.user.findUnique({ where: { id } });
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
