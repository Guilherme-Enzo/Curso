import { createReadStream, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { getApiUser, hasFullAccess } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const VIDEO_DIR = path.join(process.cwd(), "public", "uploads", "videos");

const MIME_MAP: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const user = await getApiUser();
  if (!user) return new Response("Não autenticado", { status: 401 });

  const { filename } = await params;
  const safe = path.basename(filename);
  const ext = path.extname(safe).toLowerCase();
  if (safe !== filename || !MIME_MAP[ext]) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const video = await prisma.video.findFirst({
      where: { OR: [{ url: `/uploads/videos/${safe}` }, { thumbnail: `/uploads/videos/${safe}` }] },
      select: { module: { select: { isFree: true } } },
    });
    if (video?.module && !video.module.isFree && !hasFullAccess(user)) return new Response("Versão completa necessária", { status: 403 });
    const filePath = path.join(VIDEO_DIR, safe);
    const stat = statSync(filePath);
    if (!stat.isFile()) throw new Error("Not a file");

    const range = req.headers.get("range");
    let start = 0;
    let end = stat.size - 1;
    let status = 200;

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${stat.size}` },
        });
      }
      if (!match[1] && match[2]) {
        start = Math.max(0, stat.size - Number(match[2]));
      } else {
        start = Number(match[1] || 0);
        end = match[2] ? Math.min(Number(match[2]), stat.size - 1) : end;
      }
      if (start > end || start >= stat.size) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${stat.size}` },
        });
      }
      status = 206;
    }

    const stream = createReadStream(filePath, { start, end });
    const headers: Record<string, string> = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(end - start + 1),
      "Content-Type": MIME_MAP[ext],
    };
    if (status === 206) headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;

    return new Response(Readable.toWeb(stream) as ReadableStream, { status, headers });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
