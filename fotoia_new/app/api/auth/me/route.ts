import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";
import { isValidGender } from "@/lib/gender";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, authProvider: user.authProvider, plan: user.plan, gender: user.gender },
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { name?: string; gender?: string; currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const gender = typeof body.gender === "string" ? body.gender : undefined;
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : undefined;
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : undefined;

  const data: { name?: string; gender?: string; passwordHash?: string } = {};

  if (name !== undefined) {
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "O nome deve ter entre 2 e 100 caracteres" },
        { status: 400 }
      );
    }
    data.name = name;
  }

  if (gender !== undefined) {
    if (!isValidGender(gender)) {
      return NextResponse.json({ error: "Selecione uma opção de gênero" }, { status: 400 });
    }
    data.gender = gender;
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
      dbUser?.passwordHash && (await bcrypt.compare(currentPassword, dbUser.passwordHash));
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
    select: { id: true, name: true, email: true, role: true, authProvider: true, plan: true, gender: true },
  });

  return NextResponse.json({
    message: "Perfil atualizado",
    user: updated,
  });
}

export async function DELETE() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (user.role === "admin") {
    return NextResponse.json({ error: "A conta de administrador não pode ser excluída." }, { status: 403 });
  }

  try {
    await prisma.user.delete({ where: { id: user.id } });
    const response = NextResponse.json({ message: "Conta excluída permanentemente" });
    response.cookies.set("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Não foi possível excluir a conta. Tente novamente." }, { status: 500 });
  }
}
