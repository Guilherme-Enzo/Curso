import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess } from "@/lib/session";

export async function GET() {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const categories = await prisma.promptCategory.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }, { name: "asc" }],
    include: {
      prompts: {
        where: hasFullAccess(user) ? {} : { isFree: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      },
    },
  });
  return NextResponse.json({ categories });
}
