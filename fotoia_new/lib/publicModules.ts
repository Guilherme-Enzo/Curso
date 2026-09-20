import { prisma } from "@/lib/prisma";
import { parseStoredContent } from "@/lib/contentAI";
import { MODULES } from "@/lib/modules";

export type PublicModule = {
  id: string;
  order: number;
  name: string;
  description: string | null;
  synopsis: string | null;
  pdfUrl: string | null;
  createdAt: string;
  icon: string;
  tag: string;
  summary: string;
  submodules: { title: string; content: string; images: string[] }[];
};

export async function getPublicModules(includePdf = false): Promise<PublicModule[]> {
  const dbModules = await prisma.module.findMany({
    orderBy: { order: "asc" },
  });

  return dbModules.map((module) => {
    const staticModule = MODULES.find((item) => item.id === module.order);
    const stored = parseStoredContent(module.content);

    return {
      id: module.id,
      order: module.order,
      name: module.name,
      description: module.description,
      synopsis: module.synopsis,
      pdfUrl: includePdf ? module.pdfUrl : null,
      createdAt: module.createdAt.toISOString(),
      icon: stored?.icon ?? staticModule?.icon ?? "/icofotoia-icon.png",
      tag: stored?.tag ?? staticModule?.tag ?? module.name,
      summary: stored?.summary ?? staticModule?.summary ?? module.description ?? "",
      submodules: stored?.submodules ?? staticModule?.submodules ?? [],
    };
  });
}
