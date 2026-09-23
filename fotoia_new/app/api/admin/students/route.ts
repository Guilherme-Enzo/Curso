import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET() {
  const me = await getApiUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const students = await prisma.user.findMany({
    where: { role: "student" },
    orderBy: { createdAt: "asc" },
     select: { id: true, name: true, email: true, birthDate: true, createdAt: true, plan: true },
  });

  return NextResponse.json({ students });
}

export async function POST(req: Request) {
  const me = await getApiUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  let body: { name?: string; email?: string; password?: string; birthDate?: string; plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const birthDate = String(body.birthDate ?? "");
  const plan = body.plan === "FULL" ? "FULL" : body.plan === "FREE" || body.plan === undefined ? "FREE" : "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios" }, { status: 400 });
  }
  if (!plan) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }
  if (name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Nome ou e-mail inválido" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 });
  }
  if (password.length > 128) {
    return NextResponse.json({ error: "A senha deve ter no máximo 128 caracteres" }, { status: 400 });
  }
  const parsedBirthDate = birthDate ? new Date(`${birthDate}T00:00:00.000Z`) : null;
  if (birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !parsedBirthDate || Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > new Date())) {
    return NextResponse.json({ error: "Informe uma data de nascimento válida" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const student = await prisma.user.create({
    data: { name, email, passwordHash, emailVerifiedAt: new Date(), ...(parsedBirthDate ? { birthDate: parsedBirthDate } : {}), role: "student", plan },
     select: { id: true, name: true, email: true, birthDate: true, createdAt: true, plan: true },
  });

  return NextResponse.json({ student }, { status: 201 });
}
