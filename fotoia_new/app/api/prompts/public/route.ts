import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess } from "@/lib/session";

export async function GET(request: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  if (new URL(request.url).searchParams.get("countOnly") === "1") {
    const unreadCount = await prisma.prompt.count({
      where: {
        createdAt: { gt: user.createdAt },
        ...(hasFullAccess(user) ? {} : { isFree: true }),
        views: { none: { userId: user.id } },
      },
    });
    return NextResponse.json({ unreadCount }, { headers: { "Cache-Control": "no-store, must-revalidate" } });
  }

  const viewedPromptIds = new Set(
    (await prisma.promptView.findMany({ where: { userId: user.id }, select: { promptId: true } })).map((view) => view.promptId),
  );

  const categories = await prisma.promptCategory.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }, { name: "asc" }],
    include: {
      prompts: {
        where: hasFullAccess(user) ? {} : { isFree: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      },
    },
  });
  const result = categories.map((category) => ({
    ...category,
    prompts: category.prompts.map((prompt) => ({
      ...prompt,
      isNew: !viewedPromptIds.has(prompt.id) && prompt.createdAt > user.createdAt,
    })),
  })).map((category) => ({
    ...category,
    unreadCount: category.prompts.filter((prompt) => prompt.isNew).length,
  }));
  const unreadCount = result.reduce((total, category) => total + category.prompts.filter((prompt) => prompt.isNew).length, 0);
  return NextResponse.json({ categories: result, unreadCount });
}
