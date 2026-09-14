import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { savePdf } from "@/lib/upload";
import { generateModuleQuiz, type GeneratedQuiz } from "@/lib/quizAI";
import { generateModuleContent, type GeneratedContent } from "@/lib/contentAI";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: {
      quiz: {
        select: {
          id: true,
          source: true,
          createdAt: true,
          questions: { select: { id: true } },
        },
      },
    },
  });

  return NextResponse.json({
    modules: modules.map((m) => ({
      ...m,
      quiz: m.quiz
        ? {
            id: m.quiz.id,
            source: m.quiz.source,
            createdAt: m.quiz.createdAt,
            questionCount: m.quiz.questions.length,
          }
        : null,
    })),
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

    let pdfUrl: string | null = null;
    if (file && file instanceof File) {
      pdfUrl = await savePdf(file);
    }

    const max = await prisma.module.aggregate({ _max: { order: true } });
    const order = (max._max.order ?? 0) + 1;

    const module = await prisma.module.create({
      data: { order, name, description, pdfUrl },
    });

    let quiz: GeneratedQuiz | null = null;
    let contentResult: GeneratedContent | null = null;
    let synopsisResult: string | null = null;
    const errors: string[] = [];

    if (pdfUrl) {
      const hasDescription = !!description;

      // Generate quiz and content in parallel; skip synopsis if description exists
      const [quizResult, contentGen] = await Promise.all([
        generateModuleQuiz(module.id).then((q) => q).catch((e) => {
          errors.push(e instanceof Error ? e.message : "Erro ao gerar quiz");
          return null;
        }),
        generateModuleContent(module.id, name, pdfUrl, hasDescription).then((c) => c).catch(() => ({ content: null, synopsis: null, description: null, aiError: "Erro ao gerar conteúdo" })),
      ]);
      quiz = quizResult;
      contentResult = contentGen.content;
      synopsisResult = contentGen.synopsis;
      if (contentGen.aiError) errors.push(contentGen.aiError);
    }

    return NextResponse.json({ module, quiz, content: contentResult, synopsis: synopsisResult, aiError: errors.length > 0 ? errors.join("; ") : null }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar módulo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}