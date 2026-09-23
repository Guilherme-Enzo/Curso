import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { makePromptPdf } from "@/lib/promptPdf";
import { readPromptAnalysis, removePromptAnalysis } from "@/lib/promptAnalysis";
import { savePromptImage, savePromptImageBuffer, savePromptPdfBuffer, removePromptAsset } from "@/lib/upload";
import { normalizePromptOrders } from "@/lib/promptOrder";

const validTypes = ["EDITING", "CREATION"] as const;

function textField(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem criar prompts" }, { status: 403 });

  const form = await req.formData();
  const name = textField(form, "name");
  const type = textField(form, "type");
  const categoryId = textField(form, "categoryId");
  const description = textField(form, "description");
  const promptText = textField(form, "promptText");
  const analysisToken = textField(form, "analysisToken");
  const isFree = String(form.get("isFree") ?? "false") === "true";
  const image = form.get("image");

  if (!name || name.length > 160) return NextResponse.json({ error: "Informe um nome válido para o prompt" }, { status: 400 });
  if (!validTypes.includes(type as (typeof validTypes)[number])) return NextResponse.json({ error: "Tipo de prompt inválido" }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: "Selecione uma categoria" }, { status: 400 });
  if (!description) return NextResponse.json({ error: "Informe uma descrição para o prompt" }, { status: 400 });
  if (!promptText) return NextResponse.json({ error: "Informe o texto do prompt" }, { status: 400 });

  const category = await prisma.promptCategory.findUnique({ where: { id: categoryId } });
  if (!category || category.type !== type) return NextResponse.json({ error: "Categoria inválida para este tipo de prompt" }, { status: 400 });

  let imageUrl = "";
  let pdfUrl = "";
  try {
    let imageBuffer: Buffer;
    let imageMime: string;
    if (analysisToken) {
      const analysis = await readPromptAnalysis(analysisToken, user.id);
      imageBuffer = await readFile(`${analysis.directory}/${analysis.session.imageFile}`);
      imageMime = analysis.session.imageMime;
    } else {
      if (!(image instanceof File) || image.size === 0) return NextResponse.json({ error: "A foto do prompt é obrigatória" }, { status: 400 });
      imageBuffer = Buffer.from(await image.arrayBuffer());
      imageMime = image.type;
    }

    imageUrl = analysisToken
      ? await savePromptImageBuffer(imageBuffer, imageMime)
      : await savePromptImage(image as File);
    pdfUrl = await savePromptPdfBuffer(await makePromptPdf(name, description, promptText, imageBuffer));

    const last = await prisma.prompt.findFirst({ where: { categoryId }, orderBy: { order: "desc" } });
    const prompt = await prisma.prompt.create({
      data: { categoryId, name, imageUrl, pdfUrl, description, promptText, isFree, order: (last?.order ?? 0) + 1 },
      include: { category: true },
    });
    await normalizePromptOrders(categoryId);
    if (analysisToken) await removePromptAnalysis(analysisToken);
    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    if (imageUrl) await removePromptAsset(imageUrl);
    if (pdfUrl) await removePromptAsset(pdfUrl);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível criar o prompt" }, { status: 400 });
  }
}
