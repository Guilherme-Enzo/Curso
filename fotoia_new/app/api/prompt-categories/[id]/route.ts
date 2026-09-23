import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { normalizeCategoryOrders } from "@/lib/promptOrder";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem editar categorias" }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (!name || name.length > 100) return NextResponse.json({ error: "Informe um nome de categoria válido" }, { status: 400 });

  try {
    const category = await prisma.promptCategory.update({ where: { id }, data: { name } });
    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: "Categoria não encontrada ou nome já utilizado" }, { status: 409 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem excluir categorias" }, { status: 403 });

  const { id } = await ctx.params;
  const category = await prisma.promptCategory.findUnique({ where: { id }, include: { _count: { select: { prompts: true } } } });
  if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  if (category._count.prompts > 0) return NextResponse.json({ error: "Exclua ou mova os prompts desta categoria antes de excluí-la" }, { status: 409 });

  await prisma.promptCategory.delete({ where: { id } });
  await normalizeCategoryOrders(category.type);
  return NextResponse.json({ ok: true });
}
