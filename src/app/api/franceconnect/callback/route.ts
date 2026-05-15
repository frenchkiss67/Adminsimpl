import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProfilByEmail, seedDemarchesFor, upsertProfil } from "@/lib/db";

export const runtime = "nodejs";

type IdentitePivot = {
  sub: string;
  given_name: string;
  family_name: string;
  email: string;
  birthdate: string;
  birthplace: string;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/?fc_error=missing_code", req.url));
  }

  let identite: IdentitePivot;
  try {
    identite = JSON.parse(Buffer.from(code, "base64").toString("utf-8"));
  } catch {
    return NextResponse.redirect(new URL("/?fc_error=invalid_code", req.url));
  }

  const existing = getProfilByEmail(identite.email);
  const id = existing?.id ?? `pf-${crypto.randomUUID().slice(0, 12)}`;

  const profil = upsertProfil({
    id,
    prenom: identite.given_name,
    nom: identite.family_name,
    email: identite.email,
    numero_fiscal: existing?.numero_fiscal ?? null,
    situation: existing?.situation ?? "celibataire",
    nombre_enfants: existing?.nombre_enfants ?? 0,
    revenus_annuels: existing?.revenus_annuels ?? 0,
    logement: existing?.logement ?? "locataire",
    code_postal: existing?.code_postal ?? "75001",
    franceconnect_sub: identite.sub,
  });
  seedDemarchesFor(profil.id);

  const url = new URL("/tableau-de-bord", req.url);
  url.searchParams.set("fc", "ok");
  url.searchParams.set("email", profil.email);
  return NextResponse.redirect(url);
}
