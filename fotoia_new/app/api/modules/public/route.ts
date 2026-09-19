import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { getPublicModules } from "@/lib/publicModules";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getApiUser();
  const result = await getPublicModules(Boolean(user));

  return NextResponse.json({ modules: result }, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
