import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { resolveFile } from "@/lib/upload";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ file: string }> }
) {
  const { file } = await ctx.params;
  const safe = path.normalize(file);
  if (safe.startsWith("..") || safe.includes("/") || safe.includes("\\")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const filePath = resolveFile(`arquivos/materiais/${file}`);
  const root = path.join(process.cwd(), "public", "uploads", "materiais");
  if (path.dirname(filePath) !== root) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === ".pdf" ? "application/pdf" : "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}