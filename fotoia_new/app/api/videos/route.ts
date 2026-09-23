import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hasFullAccess, isStaff } from "@/lib/session";
import { removeVideo, saveVideo } from "@/lib/upload";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId obrigatório" }, { status: 400 });
  }

  const module = await prisma.module.findUnique({ where: { id: moduleId }, select: { isFree: true } });
  if (!module) return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });
  if (!module.isFree && !hasFullAccess(user)) {
    return NextResponse.json({ error: "Só na versão completa. Atualize seu plano." }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    where: { moduleId },
    orderBy: { order: "asc" },
    include: {
      progress: user.role !== "student"
        ? undefined
        : { where: { userId: user.id }, select: { watched: true, seconds: true } },
    },
  });

  const result = videos.map((v) => ({
    id: v.id,
    title: v.title,
    description: v.description,
    url: v.url,
    thumbnail: v.thumbnail,
    duration: v.duration,
    order: v.order,
    watched: v.progress?.[0]?.watched ?? false,
    watchedSeconds: v.progress?.[0]?.seconds ?? 0,
  }));

  return NextResponse.json({ videos: result });
}

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Apenas colaboradores e admin" }, { status: 403 });
  }

  try {
    const form = await req.formData();
    const moduleId = String(form.get("moduleId") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim() || null;
    const file = form.get("file");

    if (!moduleId || !title) {
      return NextResponse.json({ error: "Módulo e título são obrigatórios" }, { status: 400 });
    }
    if (title.length > 150 || (description?.length ?? 0) > 2000) {
      return NextResponse.json({ error: "Título ou descrição excede o limite permitido" }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo de vídeo" }, { status: 400 });
    }
    const thumbFile = form.get("thumbnail");
    if (
      thumbFile &&
      thumbFile instanceof File &&
      thumbFile.size > 0 &&
      (thumbFile.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png"].includes(thumbFile.type))
    ) {
      return NextResponse.json({ error: "Miniatura inválida ou maior que 5MB" }, { status: 400 });
    }

    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) {
      return NextResponse.json({ error: "Módulo não encontrado" }, { status: 404 });
    }

    const url = await saveVideo(file);
    const maxOrder = await prisma.video.aggregate({ _max: { order: true }, where: { moduleId } });
    const order = (maxOrder._max.order ?? 0) + 1;
    const duration = Math.max(0, Math.floor(Number(form.get("duration")) || 0));

    // Save client-generated thumbnail if provided
    let thumbnail: string | null = null;
    try {
      if (thumbFile && thumbFile instanceof File && thumbFile.size > 0) {
        const thumbDir = path.join(process.cwd(), "public", "uploads", "videos");
        await mkdir(thumbDir, { recursive: true });
        const thumbName = `${randomUUID()}_thumb${thumbFile.type === "image/png" ? ".png" : ".jpg"}`;
        const buf = Buffer.from(await thumbFile.arrayBuffer());
        await writeFile(path.join(thumbDir, thumbName), buf);
        thumbnail = `/uploads/videos/${thumbName}`;
      }

      const video = await prisma.video.create({
        data: { moduleId, title, description, url, order, duration, thumbnail },
      });

      return NextResponse.json({ video }, { status: 201 });
    } catch (error) {
      await removeVideo(url);
      if (thumbnail) await removeVideo(thumbnail);
      throw error;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao enviar vídeo";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
