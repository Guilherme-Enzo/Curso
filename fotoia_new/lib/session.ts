import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  birthDate: Date | null;
  role: string;
  authProvider: string;
};

export async function getApiUser(): Promise<ApiUser | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, birthDate: true, role: true, authProvider: true },
  });

  return user;
}

export function isStaff(user: ApiUser | null): boolean {
  return !!user && (user.role === "teacher" || user.role === "admin");
}
