import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync, unlinkSync } from "fs";
import path from "path";

const BACKUP_PATH = "/tmp/appweb.tar.gz";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== "autoeletrica-backup-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!existsSync(BACKUP_PATH)) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 });
  }

  const file = readFileSync(BACKUP_PATH);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": 'attachment; filename="appweb-backup.tar.gz"',
      "Content-Length": String(file.length),
    },
  });
}
