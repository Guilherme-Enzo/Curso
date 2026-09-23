import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";

export async function PATCH(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Apenas colaboradores e admin" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const type = body.type || "modules";

    if (type === "videos") {
      const moduleId: string = body.moduleId;
      const order: string[] = body.order;
      if (!moduleId || !Array.isArray(order) || order.length === 0) {
        return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
      }
      const ids = [...new Set(order.filter((id): id is string => typeof id === "string"))];
      const videos = await prisma.video.count({
        where: { moduleId, id: { in: ids } },
      });
      if (ids.length !== order.length || videos !== ids.length) {
        return NextResponse.json({ error: "A ordem contém vídeos inválidos" }, { status: 400 });
      }
      await prisma.$transaction(
        ids.map((id, idx) =>
          prisma.video.update({
            where: { id },
            data: { order: idx + 1 },
          })
        )
      );
      return NextResponse.json({ ok: true });
    }

    const order: { id: string; order: number }[] = body.order;
    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    if (order.some((item) => !item || typeof item.id !== "string" || !Number.isInteger(item.order))) {
      return NextResponse.json({ error: "Ordem de módulos inválida" }, { status: 400 });
    }

    await prisma.$transaction(
      order.map((item) =>
        prisma.module.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao reordenar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
