import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  birthDate: Date | null;
  gender: string | null;
  role: string;
  authProvider: string;
  plan: "FREE" | "FULL";
  createdAt: Date;
};

export async function getApiUser(): Promise<ApiUser | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, birthDate: true, gender: true, role: true, authProvider: true, plan: true, createdAt: true },
  });

  return user;
}

export function isStaff(user: ApiUser | null): boolean {
  return !!user && (user.role === "teacher" || user.role === "admin");
}

export function hasFullAccess(user: ApiUser | null): boolean {
  return isStaff(user) || user?.plan === "FULL";
}
