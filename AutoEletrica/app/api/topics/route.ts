import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, role: true } },
      _count: { select: { messages: true } },
      reads: { where: { userId: user.id }, select: { readAt: true } },
    },
  });

  const unreadEntries = await Promise.all(
    topics.map(async (topic) => {
      const readAt = topic.reads[0]?.readAt;
      if (!readAt) return [topic.id, topic._count.messages] as const;
      const count = await prisma.topicMessage.count({
        where: { topicId: topic.id, createdAt: { gt: readAt } },
      });
      return [topic.id, count] as const;
    })
  );
  const unreadCounts = Object.fromEntries(unreadEntries) as Record<string, number>;

  return NextResponse.json({
    topics: topics.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      authorName: t.author.name,
      authorRole: t.author.role,
      createdAt: t.createdAt,
      messageCount: t._count.messages,
      unreadCount: unreadCounts[t.id] ?? t._count.messages,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = (body?.title ?? "").trim();
  const description = (body?.description ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "O título do tópico é obrigatório." }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json({ error: "A descrição do tópico é obrigatória." }, { status: 400 });
  }
  if (title.length > 120 || description.length > 2000) {
    return NextResponse.json({ error: "Título ou descrição excede o limite permitido." }, { status: 400 });
  }

  const topic = await prisma.topic.create({
    data: { title, description, authorId: user.id },
  });

  return NextResponse.json({ topic }, { status: 201 });
}
