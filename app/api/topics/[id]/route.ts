import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, role: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, role: true } } },
      },
    },
  });
  if (!topic) {
    return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  }

  await prisma.topicRead.upsert({
    where: { userId_topicId: { userId: user.id, topicId: id } },
    update: { readAt: new Date() },
    create: { userId: user.id, topicId: id },
  });

  return NextResponse.json({
    topic: {
      id: topic.id,
      title: topic.title,
      description: topic.description,
      authorName: topic.author.name,
      createdAt: topic.createdAt,
      messages: topic.messages.map((m) => ({
        id: m.id,
        content: m.content,
        authorId: m.authorId,
        authorName: m.author.name,
        authorRole: m.author.role,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json(
      { error: "Somente professores e administradores podem excluir tópicos." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) {
    return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  }

  await prisma.topic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}