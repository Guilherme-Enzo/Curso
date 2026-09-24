import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

const STATE_COOKIE = "google_oauth_state";
const POPUP_COOKIE = "google_oauth_popup";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google_config", request.url));
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.searchParams.get("format") === "config") {
    return NextResponse.json({ clientId }, { headers: { "Cache-Control": "no-store" } });
  }
  const state = randomBytes(32).toString("hex");
  const popup = requestUrl.searchParams.get("mode") === "popup";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? new URL("/api/auth/google/callback", request.url).toString();
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = requestUrl.searchParams.get("format") === "json"
    ? NextResponse.json({ authorizationUrl: authorizationUrl.toString() })
    : NextResponse.redirect(authorizationUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  if (popup) {
    response.cookies.set(POPUP_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    });
  } else {
    response.cookies.delete(POPUP_COOKIE);
  }
  return response;
}
