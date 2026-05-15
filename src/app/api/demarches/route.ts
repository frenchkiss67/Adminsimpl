import { NextRequest, NextResponse } from "next/server";
import { getProfilByEmail, listDemarches } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 });
  const profil = getProfilByEmail(email);
  if (!profil) return NextResponse.json({ error: "profil introuvable" }, { status: 404 });
  const demarches = listDemarches(profil.id);
  return NextResponse.json({ demarches });
}
