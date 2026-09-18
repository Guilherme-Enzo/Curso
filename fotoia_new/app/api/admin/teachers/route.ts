import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET() {
  const me = await getApiUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const teachers = await prisma.user.findMany({
    where: { role: "teacher" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json({ teachers });
}

export async function POST(req: Request) {
  const me = await getApiUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const teacher = await prisma.user.create({
    data: { name, email, passwordHash, role: "teacher" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json({ teacher }, { status: 201 });
}