import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const STATE_COOKIE = "google_oauth_state";
const POPUP_COOKIE = "google_oauth_popup";

function sameState(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function loginError(request: NextRequest, code: string) {
  if (request.cookies.get(POPUP_COOKIE)?.value === "1") {
    return popupResponse(request, { error: code });
  }
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(code)}`, request.url));
}

function jsonError(code: string) {
  return NextResponse.json({ error: code }, { status: 400 });
}

function popupResponse(request: NextRequest, payload: { destination?: string; error?: string }) {
  const origin = new URL(process.env.GOOGLE_REDIRECT_URI ?? request.url).origin;
  const message = JSON.stringify({ type: "google-oauth-result", ...payload });
  const html = `<!doctype html><html><body><script>window.opener?.postMessage(${message}, ${JSON.stringify(origin)}); window.close();</script></body></html>`;
  const response = new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(POPUP_COOKIE);
  return response;
}

async function completeLogin(request: NextRequest, code: string, redirectUri: string, popupCode: boolean) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const fail = (reason: string) => popupCode ? jsonError(reason) : loginError(request, reason);
  if (!clientId || !clientSecret) return fail("google_config");

  try {
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
    if (!tokenResponse.ok) return fail("google_token");

    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokens.access_token) return fail("google_token");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    if (!profileResponse.ok) return fail("google_profile");

    const profile = await profileResponse.json() as {
      email?: string;
      email_verified?: boolean;
      name?: string;
    };
    const email = profile.email?.trim().toLowerCase();
    if (!email || profile.email_verified !== true) return fail("google_email");

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.name?.trim() || email.split("@")[0],
          email,
          passwordHash: null,
          authProvider: "google",
          role: "student",
          emailVerifiedAt: new Date(),
        },
      });
    } else if (user.authProvider !== "google") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { authProvider: "google", emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
      });
    }

    const token = signToken({ userId: user.id, role: user.role, name: user.name, loginMethod: "google" });
    const destination = user.role === "admin" ? "/admin" : !user.birthDate || !user.gender ? "/completar-cadastro" : user.role === "teacher" ? "/professor" : "/aluno";
    const publicOrigin = new URL(process.env.GOOGLE_REDIRECT_URI ?? request.url).origin;
    if (popupCode) {
      const response = NextResponse.json({ destination });
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
    if (request.cookies.get(POPUP_COOKIE)?.value === "1") {
      const response = popupResponse(request, { destination });
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
    const response = NextResponse.redirect(new URL(destination, publicOrigin));
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
    return fail("google_login");
  }
}

export async function POST(request: NextRequest) {
  const publicOrigin = new URL(process.env.GOOGLE_REDIRECT_URI ?? request.url).origin;
  if (request.headers.get("origin") !== publicOrigin || request.headers.get("x-requested-with") !== "XmlHttpRequest") {
    return jsonError("google_origin");
  }
  const body = await request.json().catch(() => null) as { code?: string } | null;
  if (!body?.code || typeof body.code !== "string") return jsonError("google_code");
  return completeLogin(request, body.code, publicOrigin, true);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !storedState || !sameState(storedState, state)) return loginError(request, "google_state");
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? new URL("/api/auth/google/callback", request.url).toString();
  return completeLogin(request, code, redirectUri, false);
}
