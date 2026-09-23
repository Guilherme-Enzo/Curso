import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { normalizePromptOrders } from "@/lib/promptOrder";

export async function PATCH(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem organizar prompts" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const categoryId = typeof body?.categoryId === "string" ? body.categoryId : "";
  const order: string[] = Array.isArray(body?.order) ? (body.order as unknown[]).filter((id): id is string => typeof id === "string") : [];
  if (!categoryId || order.length === 0) return NextResponse.json({ error: "Ordem de prompts inválida" }, { status: 400 });

  const prompts = await prisma.prompt.findMany({ where: { categoryId }, select: { id: true } });
  if (prompts.length !== order.length || prompts.some((prompt) => !order.includes(prompt.id))) {
    return NextResponse.json({ error: "A lista de prompts está desatualizada" }, { status: 409 });
  }
  await prisma.$transaction(order.map((id, index) => prisma.prompt.update({ where: { id }, data: { order: index + 1 } })));
  await normalizePromptOrders(categoryId);
  return NextResponse.json({ ok: true });
}
