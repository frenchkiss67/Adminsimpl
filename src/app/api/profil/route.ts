import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getProfilByEmail, seedDemarchesFor, upsertProfil } from "@/lib/db";

export const runtime = "nodejs";

const ProfilSchema = z.object({
  prenom: z.string().min(1).max(100),
  nom: z.string().min(1).max(100),
  email: z.string().email().max(200),
  numeroFiscal: z.string().max(20).optional().default(""),
  situation: z.enum(["celibataire", "couple", "famille"]),
  nombreEnfants: z.number().int().min(0).max(20),
  revenusAnnuels: z.number().int().min(0).max(10_000_000),
  logement: z.enum(["locataire", "proprietaire", "heberge"]),
  codePostal: z.string().regex(/^\d{5}$/),
  franceconnectSub: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 });
  const profil = getProfilByEmail(email);
  if (!profil) return NextResponse.json({ error: "profil introuvable" }, { status: 404 });
  return NextResponse.json({ profil });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = ProfilSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const v = parsed.data;
  const existing = getProfilByEmail(v.email);
  const id = existing?.id ?? `pf-${crypto.randomUUID().slice(0, 12)}`;

  const profil = upsertProfil({
    id,
    prenom: v.prenom,
    nom: v.nom,
    email: v.email,
    numero_fiscal: v.numeroFiscal || null,
    situation: v.situation,
    nombre_enfants: v.nombreEnfants,
    revenus_annuels: v.revenusAnnuels,
    logement: v.logement,
    code_postal: v.codePostal,
    franceconnect_sub: v.franceconnectSub ?? null,
  });

  seedDemarchesFor(profil.id);
  return NextResponse.json({ profil });
}
