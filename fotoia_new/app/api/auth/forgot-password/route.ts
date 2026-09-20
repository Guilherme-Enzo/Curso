import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, clientAddress } from "@/lib/rateLimit";

const GENERIC_RESPONSE = { message: "Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha." };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const rate = checkRateLimit(`forgot:${clientAddress(req)}:${email}`, 5, 15 * 60 * 1000);
  if (!rate.allowed) return NextResponse.json(GENERIC_RESPONSE);
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "E-mail não cadastrado." }, { status: 404 });
  if (!user.passwordHash) {
    return NextResponse.json({ error: "Esta conta entra com o Google. Use o botão Continuar com Google." }, { status: 400 });
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
  });

  const origin = process.env.PUBLIC_SITE_URL || "https://retratoimaginado.cgialabs.com.br";
  try {
    await sendPasswordResetEmail(email, `${origin}/reset-password?token=${rawToken}`);
  } catch (error) {
    console.error("password reset email error:", error);
    return NextResponse.json({ error: "Não foi possível enviar o e-mail agora. Tente novamente." }, { status: 502 });
  }

  return NextResponse.json({ message: "Enviamos o link de recuperação para seu e-mail." });
}
