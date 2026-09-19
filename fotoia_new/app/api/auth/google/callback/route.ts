import { randomUUID, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const STATE_COOKIE = "google_oauth_state";

function sameState(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function loginError(request: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(code)}`, request.url));
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!clientId || !clientSecret) return loginError(request, "google_config");
  if (!code || !state || !storedState || !sameState(storedState, state)) {
    return loginError(request, "google_state");
  }

  try {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? new URL("/api/auth/google/callback", request.url).toString();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return loginError(request, "google_token");

    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokens.access_token) return loginError(request, "google_token");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    if (!profileResponse.ok) return loginError(request, "google_profile");

    const profile = await profileResponse.json() as {
      email?: string;
      email_verified?: boolean;
      name?: string;
    };
    const email = profile.email?.trim().toLowerCase();
    if (!email || profile.email_verified !== true) return loginError(request, "google_email");

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.name?.trim() || email.split("@")[0],
          email,
          passwordHash: await bcrypt.hash(randomUUID(), 10),
          role: "student",
        },
      });
    }

    const token = signToken({ userId: user.id, role: user.role, name: user.name });
    const destination = user.role === "admin" ? "/admin" : user.role === "teacher" ? "/professor" : "/aluno";
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (error) {
    console.error("google oauth error:", error);
    return loginError(request, "google_login");
  }
}
