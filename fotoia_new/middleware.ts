import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/uploads/videos/")) {
    const filename = req.nextUrl.pathname.split("/").pop();
    if (filename) {
      const url = req.nextUrl.clone();
      url.pathname = `/api/videos/serve/${filename}`;
      return NextResponse.rewrite(url);
    }
  }

  if (req.nextUrl.pathname.startsWith("/uploads/materiais/")) {
    const filename = req.nextUrl.pathname.split("/").pop();
    if (filename) {
      const url = req.nextUrl.clone();
      url.pathname = `/arquivos/materiais/${filename}`;
      return NextResponse.rewrite(url);
    }
  }

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
    "/conteudo/:path*",
    "/completar-cadastro/:path*",
    "/uploads/videos/:path*",
    "/uploads/materiais/:path*",
  ],
  runtime: "nodejs",
};
