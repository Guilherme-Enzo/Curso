import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess, isStaff } from "@/lib/session";
import { getPublicModules } from "@/lib/publicModules";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getApiUser();
  const result = await getPublicModules({ includePdf: true, user });
  const requestedOrder = Number(new URL(req.url).searchParams.get("order"));
  const requested = Number.isInteger(requestedOrder) && requestedOrder > 0
    ? await prisma.module.findFirst({ where: { order: requestedOrder }, select: { isFree: true } })
    : null;
  const accessDenied = !!requested && !requested.isFree && !hasFullAccess(user) && !isStaff(user);

  return NextResponse.json({ modules: result, accessDenied, canUseAi: hasFullAccess(user) }, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
