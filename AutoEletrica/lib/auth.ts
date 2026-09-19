import jwt from "jsonwebtoken";

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") return "dev-secret-change-me";
  throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres.");
}

export type TokenPayload = {
  userId: string;
  role: string;
  name: string;
};

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtSecret(), { algorithm: "HS256", expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, jwtSecret(), { algorithms: ["HS256"] }) as TokenPayload;
  } catch {
    return null;
  }
}
