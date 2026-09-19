import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id: videoId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const requestedSeconds = Math.max(0, Math.floor(Number(body.seconds) || 0));

  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) {
    return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 });
  }
  const seconds = video.duration > 0
    ? Math.min(requestedSeconds, video.duration)
    : requestedSeconds;
  const watched = video.duration > 0 && seconds >= Math.max(0, video.duration - 5);

  await prisma.videoProgress.upsert({
    where: { userId_videoId: { userId: user.id, videoId } },
    update: { seconds, watched },
    create: { userId: user.id, videoId, seconds, watched },
  });

  return NextResponse.json({ ok: true });
}
