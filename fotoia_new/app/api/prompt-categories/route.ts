import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { normalizeCategoryOrders } from "@/lib/promptOrder";

const validTypes = ["EDITING", "CREATION"] as const;

export async function GET() {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const categories = await prisma.promptCategory.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }, { name: "asc" }],
    include: { _count: { select: { prompts: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem criar categorias" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const type = String(body?.type ?? "");
  if (!name || name.length > 100) return NextResponse.json({ error: "Informe um nome de categoria válido" }, { status: 400 });
  if (!validTypes.includes(type as (typeof validTypes)[number])) return NextResponse.json({ error: "Tipo de categoria inválido" }, { status: 400 });

  const last = await prisma.promptCategory.findFirst({ where: { type: type as "EDITING" | "CREATION" }, orderBy: { order: "desc" } });
  try {
    const category = await prisma.promptCategory.create({
      data: { name, type: type as "EDITING" | "CREATION", order: (last?.order ?? 0) + 1 },
    });
    await normalizeCategoryOrders(type as "EDITING" | "CREATION");
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Já existe uma categoria com esse nome neste tipo" }, { status: 409 });
  }
}
