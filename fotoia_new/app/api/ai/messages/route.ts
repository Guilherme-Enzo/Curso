import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  if (!moduleId) {
    return NextResponse.json(
      { error: "moduleId é obrigatório" },
      { status: 400 }
    );
  }

  const messages = await prisma.aiMessage.findMany({
    where: { userId: user.id, moduleId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, role: true, content: true },
  });

  return NextResponse.json({ messages: messages.reverse() });
}
