import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";
import { displayName } from "@/lib/displayName";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) {
    return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const content = (body?.content ?? "").trim();
  if (!content) {
    return NextResponse.json(
      { error: "O comentário não pode ser vazio." },
      { status: 400 }
    );
  }
  if (content.length > 4000) {
    return NextResponse.json({ error: "O comentário deve ter no máximo 4000 caracteres." }, { status: 400 });
  }

  const message = await prisma.topicMessage.create({
    data: { topicId: id, authorId: user.id, content },
    include: { author: { select: { name: true, role: true } } },
  });

  return NextResponse.json(
    {
      message: {
        id: message.id,
        content: message.content,
        authorId: message.authorId,
         authorName: displayName(message.author.name, message.author.role),
        authorRole: message.author.role,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    },
    { status: 201 }
  );
}
