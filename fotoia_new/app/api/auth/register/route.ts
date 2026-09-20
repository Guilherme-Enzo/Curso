import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { checkRateLimit, clientAddress } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const birthDate = typeof body?.birthDate === "string" ? body.birthDate : "";
    const role = "student"; // cadastro público é só de aluno; professores são criados pelo admin

    if (!name || !email || !password || !birthDate) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "O nome deve ter entre 2 e 100 caracteres" }, { status: 400 });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }
    if (password.length > 128) {
      return NextResponse.json({ error: "A senha deve ter no máximo 128 caracteres" }, { status: 400 });
    }

    const parsedBirthDate = new Date(`${birthDate}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > new Date()) {
      return NextResponse.json({ error: "Informe uma data de nascimento válida" }, { status: 400 });
    }

    const rate = checkRateLimit(`register:${clientAddress(req)}`, 5, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Muitos cadastros recentes. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, birthDate: parsedBirthDate, role },
    });

    const token = signToken({ userId: user.id, role: user.role, name: user.name });

    const res = NextResponse.json({
      message: "Cadastro realizado com sucesso",
      user: { id: user.id, name: user.name, email: user.email, birthDate: user.birthDate, role: user.role },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
