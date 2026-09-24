import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess, isStaff } from "@/lib/session";
import { getPublicModules } from "@/lib/publicModules";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getApiUser();
  const result = await getPublicModules({ includePdf: true, user });
  const viewedModuleIds = user
    ? new Set((await prisma.moduleView.findMany({ where: { userId: user.id }, select: { moduleId: true } })).map((view) => view.moduleId))
    : new Set<string>();
  const modules = result.map((module) => ({
    ...module,
    isNew: !!user && user.role === "student" && !viewedModuleIds.has(module.id) && new Date(module.createdAt) > user.createdAt,
  }));
  const requestedOrder = Number(new URL(req.url).searchParams.get("order"));
  const requested = Number.isInteger(requestedOrder) && requestedOrder > 0
    ? await prisma.module.findFirst({ where: { order: requestedOrder }, select: { isFree: true } })
    : null;
  const accessDenied = !!requested && !requested.isFree && !hasFullAccess(user) && !isStaff(user);

  return NextResponse.json({ modules, unreadCount: modules.filter((module) => module.isNew).length, accessDenied, canUseAi: hasFullAccess(user) }, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
