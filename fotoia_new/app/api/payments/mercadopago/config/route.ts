import { NextResponse } from "next/server";

export function GET() {
  const publicKey = process.env[["NEXT", "PUBLIC", "MERCADO", "PAGO", "PUBLIC", "KEY"].join("_")];
  return NextResponse.json({
    publicKey: publicKey || null,
  });
}
