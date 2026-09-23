import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";
import { displayName } from "@/lib/displayName";

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
      authorId: topic.authorId,
       authorName: displayName(topic.author.name, topic.author.role),
      createdAt: topic.createdAt,
      messages: topic.messages.map((m) => ({
        id: m.id,
        content: m.content,
        authorId: m.authorId,
         authorName: displayName(m.author.name, m.author.role),
        authorRole: m.author.role,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) return NextResponse.json({ error: "Tópico não encontrado." }, { status: 404 });
  if (topic.authorId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Você só pode editar seus próprios tópicos." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const title = (body?.title ?? "").trim();
  const description = (body?.description ?? "").trim();
  if (!title || !description) {
    return NextResponse.json({ error: "O título e a descrição são obrigatórios." }, { status: 400 });
  }
  if (title.length > 120 || description.length > 2000) {
    return NextResponse.json({ error: "Título ou descrição excede o limite permitido." }, { status: 400 });
  }

  const updated = await prisma.topic.update({ where: { id }, data: { title, description } });
  return NextResponse.json({ topic: updated });
}

export async function DELETE(
  _req: Request,
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
  if (topic.authorId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Você só pode excluir seus próprios tópicos." }, { status: 403 });
  }

  await prisma.topic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
