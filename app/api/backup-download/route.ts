import { NextRequest } from "next/server";
import { createReadStream, existsSync } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const BACKUP_PATH = "/tmp/appweb.tar.gz";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== "autoeletrica-backup-2026") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!existsSync(BACKUP_PATH)) {
    return new Response("Backup not found", { status: 404 });
  }

  const stat = require("fs").statSync(BACKUP_PATH);
  const stream = createReadStream(BACKUP_PATH);

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": 'attachment; filename="appweb-backup.tar.gz"',
      "Content-Length": String(stat.size),
      "Cache-Control": "no-cache",
    },
  });
}
