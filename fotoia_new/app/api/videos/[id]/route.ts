import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, isStaff } from "@/lib/session";
import { removeVideo } from "@/lib/upload";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas professores e admin" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: { title?: string; description?: string | null } = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.description !== undefined) data.description = String(body.description).trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.video.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!isStaff(user)) return NextResponse.json({ error: "Apenas professores e admin" }, { status: 403 });

  const { id } = await params;
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await removeVideo(video.url);
  if (video.thumbnail) await removeVideo(video.thumbnail);
  await prisma.videoProgress.deleteMany({ where: { videoId: id } });
  await prisma.video.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
