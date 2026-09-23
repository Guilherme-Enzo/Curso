import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

function redirect(req: NextRequest, query: string) {
  const origin = process.env.PUBLIC_SITE_URL || new URL(req.url).origin;
  return NextResponse.redirect(new URL(`/login?${query}`, origin));
}

export async function GET(req: NextRequest) {
  const rawToken = req.nextUrl.searchParams.get("token") || "";
  if (!rawToken) return redirect(req, "error=verification_invalid");

  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const token = await prisma.emailVerificationToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!token || token.usedAt || token.expiresAt <= new Date()) {
    return redirect(req, "error=verification_invalid");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);

  const jwtToken = signToken({ userId: token.user.id, role: token.user.role, name: token.user.name, loginMethod: "password" });
  const origin = process.env.PUBLIC_SITE_URL || new URL(req.url).origin;
  const response = NextResponse.redirect(new URL("/aluno?complete=1", origin));
  response.cookies.set("token", jwtToken, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
