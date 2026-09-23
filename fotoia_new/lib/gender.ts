export const genderOptions = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" },
  { value: "other", label: "Outro" },
  { value: "prefer_not_to_say", label: "Prefiro não informar" },
] as const;

export type Gender = (typeof genderOptions)[number]["value"];

export function isValidGender(value: unknown): value is Gender {
  return typeof value === "string" && genderOptions.some((option) => option.value === value);
}

export function getGenderLabel(value: string | null | undefined) {
  return genderOptions.find((option) => option.value === value)?.label ?? "Não informado";
}
