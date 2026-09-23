import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { makePromptPdf } from "@/lib/promptPdf";
import { readPromptAnalysis, removePromptAnalysis } from "@/lib/promptAnalysis";
import { removePromptAsset, savePromptImage, savePromptImageBuffer, savePromptPdfBuffer, resolvePromptAsset } from "@/lib/upload";
import { normalizePromptOrders } from "@/lib/promptOrder";

const validTypes = ["EDITING", "CREATION"] as const;

function textField(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function imageMime(url: string): string {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem editar prompts" }, { status: 403 });

  const { id } = await ctx.params;
  const existing = await prisma.prompt.findUnique({ where: { id }, include: { category: true } });
  if (!existing) return NextResponse.json({ error: "Prompt não encontrado" }, { status: 404 });

  const form = await req.formData();
  const name = textField(form, "name") || existing.name;
  const categoryId = textField(form, "categoryId") || existing.categoryId;
  const type = textField(form, "type") || existing.category.type;
  const description = textField(form, "description");
  const promptText = textField(form, "promptText");
  const analysisToken = textField(form, "analysisToken");
  const isFree = form.has("isFree") ? String(form.get("isFree")) === "true" : existing.isFree;
  const image = form.get("image");

  if (!name || name.length > 160) return NextResponse.json({ error: "Informe um nome válido para o prompt" }, { status: 400 });
  if (!description) return NextResponse.json({ error: "Informe uma descrição para o prompt" }, { status: 400 });
  if (!promptText) return NextResponse.json({ error: "Informe o texto do prompt" }, { status: 400 });
  if (!validTypes.includes(type as (typeof validTypes)[number])) return NextResponse.json({ error: "Tipo de prompt inválido" }, { status: 400 });

  const category = await prisma.promptCategory.findUnique({ where: { id: categoryId } });
  if (!category || category.type !== type) return NextResponse.json({ error: "Categoria inválida para este tipo de prompt" }, { status: 400 });

  const newImage = image instanceof File && image.size > 0 ? image : null;
  let imageUrl = existing.imageUrl;
  let pdfUrl = "";
  try {
    let imageBuffer: Buffer;
    let mime: string;
    if (analysisToken) {
      const analysis = await readPromptAnalysis(analysisToken, user.id);
      imageBuffer = await readFile(`${analysis.directory}/${analysis.session.imageFile}`);
      mime = analysis.session.imageMime;
      imageUrl = await savePromptImageBuffer(imageBuffer, mime);
    } else if (newImage) {
      imageBuffer = Buffer.from(await newImage.arrayBuffer());
      mime = newImage.type;
      imageUrl = await savePromptImage(newImage);
    } else {
      imageBuffer = await readFile(resolvePromptAsset(existing.imageUrl));
      mime = imageMime(existing.imageUrl);
    }

    void mime;
    pdfUrl = await savePromptPdfBuffer(await makePromptPdf(name, description, promptText, imageBuffer));
    const oldCategoryId = existing.categoryId;
    const categoryChanged = oldCategoryId !== categoryId;
    const newOrder = categoryChanged
      ? ((await prisma.prompt.findFirst({ where: { categoryId }, orderBy: { order: "desc" } }))?.order ?? 0) + 1
      : existing.order;
    const prompt = await prisma.prompt.update({
      where: { id },
      data: { name, categoryId, order: newOrder, imageUrl, pdfUrl, description, promptText, isFree },
      include: { category: true },
    });
    if (existing.imageUrl !== imageUrl) await removePromptAsset(existing.imageUrl);
    await removePromptAsset(existing.pdfUrl);
    if (categoryChanged) await normalizePromptOrders(oldCategoryId);
    await normalizePromptOrders(categoryId);
    if (analysisToken) await removePromptAnalysis(analysisToken);
    return NextResponse.json({ prompt });
  } catch (error) {
    if (imageUrl !== existing.imageUrl) await removePromptAsset(imageUrl);
    if (pdfUrl) await removePromptAsset(pdfUrl);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível editar o prompt" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem excluir prompts" }, { status: 403 });

  const { id } = await ctx.params;
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) return NextResponse.json({ error: "Prompt não encontrado" }, { status: 404 });
  await prisma.prompt.delete({ where: { id } });
  await removePromptAsset(prompt.imageUrl);
  await removePromptAsset(prompt.pdfUrl);
  await normalizePromptOrders(prompt.categoryId);
  return NextResponse.json({ ok: true });
}
