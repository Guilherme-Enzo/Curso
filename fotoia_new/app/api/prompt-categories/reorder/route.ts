import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { normalizeCategoryOrders } from "@/lib/promptOrder";

export async function PATCH(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem organizar categorias" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const type = body?.type;
  const order: string[] = Array.isArray(body?.order) ? (body.order as unknown[]).filter((id): id is string => typeof id === "string") : [];
  if (type !== "EDITING" && type !== "CREATION" || order.length === 0) {
    return NextResponse.json({ error: "Ordem de categorias inválida" }, { status: 400 });
  }

  const categories = await prisma.promptCategory.findMany({ where: { type }, select: { id: true } });
  if (categories.length !== order.length || categories.some((category) => !order.includes(category.id))) {
    return NextResponse.json({ error: "A lista de categorias está desatualizada" }, { status: 409 });
  }
  await prisma.$transaction(order.map((id, index) => prisma.promptCategory.update({ where: { id }, data: { order: index + 1 } })));
  await normalizeCategoryOrders(type);
  return NextResponse.json({ ok: true });
}
