export function displayName(name: string, role: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (role === "admin") return "Administrador";
  if (role === "teacher") return `Colaborador${parts[0] ? ` ${parts[0]}` : ""}`;
  return `Usuário${parts.length ? ` ${parts.slice(0, 2).join(" ")}` : ""}`;
}
