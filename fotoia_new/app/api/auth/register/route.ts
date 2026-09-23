import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { issueEmailVerification } from "@/lib/emailVerification";
import { checkRateLimit, clientAddress } from "@/lib/rateLimit";
import { isValidGender } from "@/lib/gender";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const birthDate = typeof body?.birthDate === "string" ? body.birthDate : "";
    const gender = typeof body?.gender === "string" ? body.gender : "";
    const role = "student"; // cadastro público é só de usuário; colaboradores são criados pelo admin

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }
    if (gender && !isValidGender(gender)) {
      return NextResponse.json({ error: "Selecione uma opção de gênero" }, { status: 400 });
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

    const parsedBirthDate = birthDate ? new Date(`${birthDate}T00:00:00.000Z`) : null;
    if (birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !parsedBirthDate || Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > new Date())) {
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
      data: { name, email, passwordHash, ...(parsedBirthDate ? { birthDate: parsedBirthDate } : {}), ...(gender ? { gender } : {}), role },
    });

    try {
      const origin = process.env.PUBLIC_SITE_URL || new URL(req.url).origin;
      await issueEmailVerification(user.id, user.email, origin);
    } catch (error) {
      await prisma.user.delete({ where: { id: user.id } });
      console.error("verification email error:", error);
      return NextResponse.json({ error: "Não foi possível enviar o e-mail de confirmação. Tente novamente." }, { status: 502 });
    }

    return NextResponse.json({
      message: "Cadastro realizado. Enviamos um link de confirmação para o seu e-mail.",
    });
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
