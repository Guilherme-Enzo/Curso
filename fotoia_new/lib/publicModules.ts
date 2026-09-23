import { prisma } from "@/lib/prisma";
import { parseStoredContent } from "@/lib/contentAI";
import { MODULES } from "@/lib/modules";
import { hasFullAccess, isStaff, type ApiUser } from "@/lib/session";

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
  isFree: boolean;
  submodules: { title: string; content: string; images: string[] }[];
};

export async function getPublicModules(options: { includePdf?: boolean; includeLocked?: boolean; user?: ApiUser | null } = {}): Promise<PublicModule[]> {
  const user = options.user ?? null;
  const canSeePaid = hasFullAccess(user);
  const dbModules = await prisma.module.findMany({
    orderBy: { order: "asc" },
  });

  return dbModules.filter((module) => options.includeLocked || isStaff(user) || canSeePaid || module.isFree).map((module) => {
    const staticModule = MODULES.find((item) => item.id === module.order);
    const stored = parseStoredContent(module.content);

    return {
      id: module.id,
      order: module.order,
      name: module.name,
      description: module.description,
      synopsis: module.synopsis,
      pdfUrl: options.includePdf && (isStaff(user) || canSeePaid || module.isFree) ? module.pdfUrl : null,
      createdAt: module.createdAt.toISOString(),
      icon: stored?.icon ?? staticModule?.icon ?? "/icofotoia-icon.png",
      tag: stored?.tag ?? staticModule?.tag ?? module.name,
      summary: stored?.summary ?? staticModule?.summary ?? module.description ?? "",
      isFree: module.isFree,
      submodules: stored?.submodules ?? staticModule?.submodules ?? [],
    };
  });
}
