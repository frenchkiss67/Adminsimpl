import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CERFA_CATALOGUE, type Cerfa } from "@/lib/cerfa";
import { getProfilByEmail, type Profil } from "@/lib/db";
import type { ChampRempli, PreRemplissage } from "@/lib/preRemplissage";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email(),
  cerfaRef: z.string(),
});

const SITUATION_LABEL: Record<Profil["situation"], string> = {
  celibataire: "Célibataire",
  couple: "En couple",
  famille: "En couple",
};

const LOGEMENT_LABEL: Record<Profil["logement"], string> = {
  locataire: "Locataire",
  proprietaire: "Propriétaire",
  heberge: "Hébergé à titre gratuit",
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { email, cerfaRef } = parsed.data;
  const cerfa = CERFA_CATALOGUE[cerfaRef];
  if (!cerfa) return NextResponse.json({ error: "cerfa inconnu" }, { status: 404 });

  const profil = getProfilByEmail(email);
  if (!profil) return NextResponse.json({ error: "profil introuvable" }, { status: 404 });

  return NextResponse.json(preRemplir(profil, cerfa));
}

function preRemplir(profil: Profil, cerfa: Cerfa): PreRemplissage {
  const alertes: string[] = [];

  const champs: ChampRempli[] = cerfa.champs.map((c) => {
    const champ = remplirChamp(profil, c.cle);
    if (champ.valeur === "" && c.obligatoire) {
      alertes.push(`Champ obligatoire "${c.cle}" non rempli`);
    }
    return champ;
  });

  return {
    cerfa: { reference: cerfa.reference, titre: cerfa.titre, organisme: cerfa.organisme },
    champs,
    alertes,
  };
}

function remplirChamp(profil: Profil, cle: string): ChampRempli {
  switch (cle) {
    case "nom":
      return { cle, valeur: profil.nom, confiance: "haute", source: "profil.nom" };
    case "prenom":
      return { cle, valeur: profil.prenom, confiance: "haute", source: "profil.prenom" };
    case "email":
      return { cle, valeur: profil.email, confiance: "haute", source: "profil.email" };
    case "situation":
      return {
        cle,
        valeur: SITUATION_LABEL[profil.situation],
        confiance: "haute",
        source: "profil.situation",
      };
    case "nb_enfants":
      return {
        cle,
        valeur: String(profil.nombre_enfants),
        confiance: "haute",
        source: "profil.nombre_enfants",
      };
    case "revenus_3_mois":
      return {
        cle,
        valeur: String(Math.round(profil.revenus_annuels / 4)),
        confiance: "moyenne",
        source: "profil.revenus_annuels / 4 (estimation)",
      };
    case "logement":
      return {
        cle,
        valeur: LOGEMENT_LABEL[profil.logement],
        confiance: "haute",
        source: "profil.logement",
      };
    case "code_postal":
      return {
        cle,
        valeur: profil.code_postal,
        confiance: "haute",
        source: "profil.code_postal",
      };
    case "numero_fiscal":
      return {
        cle,
        valeur: profil.numero_fiscal ?? "",
        confiance: profil.numero_fiscal ? "haute" : "faible",
        source: "profil.numero_fiscal",
      };
    case "salaires_nets":
      return {
        cle,
        valeur: String(profil.revenus_annuels),
        confiance: "moyenne",
        source: "profil.revenus_annuels",
      };
    case "parts_fiscales": {
      const base = profil.situation === "celibataire" ? 1 : 2;
      const enfants = profil.nombre_enfants;
      const parts = base + (enfants <= 2 ? enfants * 0.5 : 1 + (enfants - 2));
      return {
        cle,
        valeur: String(parts),
        confiance: "moyenne",
        source: "calculé depuis situation + nombre_enfants",
      };
    }
    default:
      return { cle, valeur: "", confiance: "faible", source: "" };
  }
}
