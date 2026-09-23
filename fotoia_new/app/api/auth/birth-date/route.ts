import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isValidGender } from "@/lib/gender";

export async function PATCH(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const birthDate = typeof body?.birthDate === "string" ? body.birthDate : "";
  const gender = typeof body?.gender === "string" ? body.gender : undefined;
  const parsedBirthDate = new Date(`${birthDate}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > new Date()) {
    return NextResponse.json({ error: "Informe uma data de nascimento válida" }, { status: 400 });
  }
  if (gender !== undefined && !isValidGender(gender)) {
    return NextResponse.json({ error: "Selecione uma opção de gênero" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { birthDate: parsedBirthDate, ...(gender !== undefined ? { gender } : {}) },
    select: { id: true, name: true, email: true, birthDate: true, gender: true, role: true },
  });
  return NextResponse.json({ user: updated });
}
