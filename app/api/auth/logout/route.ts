import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const isSecure = req.headers.get("x-forwarded-proto") === "https";
  const res = NextResponse.json({ message: "Sessão encerrada" });
  res.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: isSecure,
  });
  return res;
}