import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos" },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, role: user.role, name: user.name });

    const isSecure = req.headers.get("x-forwarded-proto") === "https";

    const res = NextResponse.json({
      message: "Login realizado com sucesso",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: isSecure,
    });

    return res;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}