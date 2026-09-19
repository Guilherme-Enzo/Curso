import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token || !verifyToken(token)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/aluno/:path*",
    "/professor/:path*",
    "/admin/:path*",
    "/perfil/:path*",
    "/comunidade/:path*",
    "/conteudo/:path*",
  ],
};
