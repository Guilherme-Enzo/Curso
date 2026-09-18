import { NextRequest } from "next/server";
import { readFileSync, existsSync } from "fs";

const FILE_PATH = "/tmp/aeweb_deploy/ANOTACOES_APP.md";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== "autoeletrica-backup-2026") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!existsSync(FILE_PATH)) {
    return new Response("File not found", { status: 404 });
  }

  const content = readFileSync(FILE_PATH, "utf-8");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ANOTACOES_APP.md"',
      "Cache-Control": "no-cache",
    },
  });
}
