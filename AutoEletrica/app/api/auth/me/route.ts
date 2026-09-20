import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { name?: string; currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : undefined;
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : undefined;

  const data: { name?: string; passwordHash?: string } = {};

  if (name !== undefined) {
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "O nome deve ter entre 2 e 100 caracteres" },
        { status: 400 }
      );
    }
    data.name = name;
  }

  if (newPassword !== undefined) {
    if (newPassword.length < 6 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "A nova senha deve ter entre 6 e 128 caracteres" },
        { status: 400 }
      );
    }
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Informe a senha atual para trocar a senha" },
        { status: 400 }
      );
    }
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const ok =
      dbUser && (await bcrypt.compare(currentPassword, dbUser.passwordHash));
    if (!ok) {
      return NextResponse.json(
        { error: "A senha atual está incorreta" },
        { status: 400 }
      );
    }
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({
    message: "Perfil atualizado",
    user: updated,
  });
}
