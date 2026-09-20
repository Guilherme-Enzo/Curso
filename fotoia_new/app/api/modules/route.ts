import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { removeFile, savePdf } from "@/lib/upload";
import { generateModuleContent, type GeneratedContent } from "@/lib/contentAI";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ modules }, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Apenas professores e admin podem criar módulos" }, { status: 403 });
  }

  try {
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim() || null;
    const file = form.get("file");

    if (!name) {
      return NextResponse.json({ error: "O nome do módulo é obrigatório" }, { status: 400 });
    }
    if (name.length > 150 || (description?.length ?? 0) > 5000) {
      return NextResponse.json({ error: "Nome ou descrição excede o limite permitido" }, { status: 400 });
    }

    let pdfUrl: string | null = null;
    if (file && file instanceof File && file.size > 0) {
      pdfUrl = await savePdf(file);
    }

    const max = await prisma.module.aggregate({ _max: { order: true } });
    const order = (max._max.order ?? 0) + 1;

    let module;
    try {
      module = await prisma.module.create({
        data: { order, name, description, pdfUrl },
      });
    } catch (error) {
      if (pdfUrl) await removeFile(pdfUrl);
      throw error;
    }

    let contentResult: GeneratedContent | null = null;
    let synopsisResult: string | null = null;
    const errors: string[] = [];

    if (pdfUrl) {
      const hasDescription = !!description;

      const contentGen = await generateModuleContent(module.id, name, pdfUrl, hasDescription).catch(() => ({ content: null, synopsis: null, description: null, aiError: "Erro ao gerar conteúdo" }));
      contentResult = contentGen.content;
      synopsisResult = contentGen.synopsis;
      if (contentGen.aiError) errors.push(contentGen.aiError);
    }

    return NextResponse.json({ module, content: contentResult, synopsis: synopsisResult, aiError: errors.length > 0 ? errors.join("; ") : null }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar módulo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
