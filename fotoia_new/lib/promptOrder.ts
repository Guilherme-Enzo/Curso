import { prisma } from "@/lib/prisma";

export async function normalizeCategoryOrders(type: "EDITING" | "CREATION") {
  const categories = await prisma.promptCategory.findMany({ where: { type }, orderBy: [{ order: "asc" }, { name: "asc" }] });
  await prisma.$transaction(categories.map((category, index) => prisma.promptCategory.update({ where: { id: category.id }, data: { order: index + 1 } })));
}

export async function normalizePromptOrders(categoryId: string) {
  const prompts = await prisma.prompt.findMany({ where: { categoryId }, orderBy: [{ order: "asc" }, { name: "asc" }] });
  await prisma.$transaction(prompts.map((prompt, index) => prisma.prompt.update({ where: { id: prompt.id }, data: { order: index + 1 } })));
}
