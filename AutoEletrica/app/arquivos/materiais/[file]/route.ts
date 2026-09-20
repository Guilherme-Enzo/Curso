import { createReadStream, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { getApiUser } from "@/lib/session";
import { resolveFile } from "@/lib/upload";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ file: string }> }
) {
  const user = await getApiUser();
  if (!user) return new Response("Não autenticado", { status: 401 });

  const { file } = await ctx.params;
  const safe = path.basename(file);
  if (safe !== file || path.extname(safe).toLowerCase() !== ".pdf") {
    return new Response("Forbidden", { status: 403 });
  }

  const filePath = resolveFile(safe);
  try {
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
        const suffix = Number(match[2]);
        start = Math.max(0, stat.size - suffix);
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
      "Content-Type": "application/pdf",
    };
    if (status === 206) headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;

    return new Response(Readable.toWeb(stream) as ReadableStream, { status, headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
