import { NextResponse } from "next/server";
import { getApiUser, isStaff } from "@/lib/session";
import { createPromptAnalysis, PromptPdfError } from "@/lib/promptAnalysis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas colaboradores e admin podem analisar prompts" }, { status: 403 });

  const form = await req.formData();
  const pdf = form.get("pdf");
  if (!(pdf instanceof File) || pdf.size === 0) return NextResponse.json({ error: "Selecione um PDF para analisar." }, { status: 400 });

  try {
    const result = await createPromptAnalysis(user.id, Buffer.from(await pdf.arrayBuffer()));
    return NextResponse.json({ analysisToken: result.token, fields: result, imageUrl: result.imageUrl });
  } catch (error) {
    if (error instanceof PromptPdfError) {
      return NextResponse.json({ error: error.message, missing: error.missing }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível ler o PDF." }, { status: 400 });
  }
}
