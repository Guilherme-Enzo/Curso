import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

async function findMessage(topicId: string, messageId: string) {
  return prisma.topicMessage.findFirst({
    where: { id: messageId, topicId },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id, messageId } = await params;
  const message = await findMessage(id, messageId);
  if (!message) {
    return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
  }
  if (message.authorId !== user.id) {
    return NextResponse.json(
      { error: "Você só pode editar os seus próprios comentários." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const content = (body?.content ?? "").trim();
  if (!content) {
    return NextResponse.json(
      { error: "O comentário não pode ser vazio." },
      { status: 400 }
    );
  }

  const updated = await prisma.topicMessage.update({
    where: { id: messageId },
    data: { content },
    include: { author: { select: { name: true, role: true } } },
  });

  return NextResponse.json({
    message: {
      id: updated.id,
      content: updated.content,
      authorId: updated.authorId,
      authorName: updated.author.name,
      authorRole: updated.author.role,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id, messageId } = await params;
  const message = await findMessage(id, messageId);
  if (!message) {
    return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
  }
  if (message.authorId !== user.id) {
    return NextResponse.json(
      { error: "Você só pode excluir os seus próprios comentários." },
      { status: 403 }
    );
  }

  await prisma.topicMessage.delete({ where: { id: messageId } });
  return NextResponse.json({ ok: true });
}