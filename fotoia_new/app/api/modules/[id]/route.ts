import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { savePdf, removeFile } from "@/lib/upload";
import { generateModuleQuiz, type GeneratedQuiz } from "@/lib/quizAI";
import { generateModuleContent, type GeneratedContent } from "@/lib/contentAI";

async function findModule(id: string) {
  return prisma.module.findUnique({ where: { id } });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Apenas professores e admin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await findModule(id);
  if (!existing) {
    return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });
  }

  try {
    const ct = req.headers.get("content-type") ?? "";
    let name: string;
    let description: string | null;
    let pdfUrl = existing.pdfUrl;
    let changedPdf = false;

    if (ct.includes("application/json")) {
      const body = await req.json();
      name = String(body.name ?? existing.name ?? "").trim();
      description = body.description !== undefined ? (String(body.description).trim() || null) : existing.description;
      if (body.pdfUrl !== undefined && body.pdfUrl === null && existing.pdfUrl) {
        await removeFile(existing.pdfUrl);
        pdfUrl = null;
        changedPdf = true;
      }
    } else {
      const form = await req.formData();
      name = String(form.get("name") ?? "").trim();
      description = String(form.get("description") ?? "").trim() || null;
      const file = form.get("file");
      if (file && file instanceof File) {
        pdfUrl = await savePdf(file);
        changedPdf = true;
        if (existing.pdfUrl) await removeFile(existing.pdfUrl);
      }
    }

    if (!name) {
      return NextResponse.json({ error: "O nome do módulo é obrigatório" }, { status: 400 });
    }

    const updated = await prisma.module.update({
      where: { id },
      data: { name, description, pdfUrl },
    });

    let quiz: GeneratedQuiz | null = null;
    let contentResult: GeneratedContent | null = null;
    let synopsisResult: string | null = null;
    const errors: string[] = [];

    // If PDF changed, regenerate content (and synopsis only if no description)
    if (changedPdf) {
      const hasDescription = !!description;
      const [quizResult, contentGen] = await Promise.all([
        generateModuleQuiz(updated.id).then((q) => q).catch((e) => {
          errors.push(e instanceof Error ? e.message : "Erro ao gerar quiz");
          return null;
        }),
        generateModuleContent(updated.id, updated.name, pdfUrl!, hasDescription).then((c) => c).catch(() => ({ content: null, synopsis: null, description: null, aiError: "Erro ao gerar conteúdo" })),
      ]);
      quiz = quizResult;
      contentResult = contentGen.content;
      synopsisResult = contentGen.synopsis;
      if (contentGen.aiError) errors.push(contentGen.aiError);
    }

    return NextResponse.json({ module: updated, quiz, content: contentResult, synopsis: synopsisResult, aiError: errors.length > 0 ? errors.join("; ") : null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar módulo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Apenas professores e admin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await findModule(id);
  if (!existing) {
    return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Limpar registros relacionados antes de deletar o módulo
      await tx.aiMessage.deleteMany({ where: { moduleId: id } });
      await tx.quizAttempt.deleteMany({ where: { moduleId: id } });
      await tx.studyTime.deleteMany({ where: { moduleId: id } });
      await tx.module.delete({ where: { id } });
      if (typeof existing.order === "number") {
        await tx.module.updateMany({
          where: { order: { gt: existing.order } },
          data: { order: { decrement: 1 } },
        });
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir módulo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (existing.pdfUrl) await removeFile(existing.pdfUrl);

  return NextResponse.json({ ok: true });
}