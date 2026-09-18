import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MODULES } from "@/lib/modules";
import { parseStoredContent } from "@/lib/contentAI";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbModules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: { quiz: { select: { id: true } } },
  });

  const result = dbModules.map((m) => {
    const staticMod = MODULES.find((s) => s.id === m.order);
    const dbContent = parseStoredContent(m.content);

    // Prioridade: conteúdo salvo no DB (IA) > array estático > fallback
    const icon = dbContent?.icon ?? staticMod?.icon ?? "📘";
    const tag = dbContent?.tag ?? staticMod?.tag ?? m.name;
    const summary = dbContent?.summary ?? staticMod?.summary ?? m.description ?? "";
    const submodules = dbContent?.submodules ?? staticMod?.submodules ?? [];

    return {
      id: m.id,
      order: m.order,
      name: m.name,
      description: m.description,
      synopsis: m.synopsis,
      pdfUrl: m.pdfUrl,
      createdAt: m.createdAt.toISOString(),
      hasQuiz: !!m.quiz,
      icon,
      tag,
      summary,
      submodules,
    };
  });

  return NextResponse.json({ modules: result }, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
