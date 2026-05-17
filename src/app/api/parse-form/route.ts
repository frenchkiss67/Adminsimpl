import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CERFA_CATALOGUE, type Cerfa } from "@/lib/cerfa";
import { getProfilByEmail, type Profil } from "@/lib/db";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().email(),
  cerfaRef: z.string(),
});

type ChampRempli = {
  cle: string;
  valeur: string;
  confiance: "haute" | "moyenne" | "faible";
  source: string;
};

type Reponse = {
  cerfa: { reference: string; titre: string; organisme: string };
  champs: ChampRempli[];
  alertes: string[];
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

function preRemplir(profil: Profil, cerfa: Cerfa): Reponse {
  const situationLabel: Record<Profil["situation"], string> = {
    celibataire: "Célibataire",
    couple: "En couple",
    famille: "En couple",
  };
  const logementLabel: Record<Profil["logement"], string> = {
    locataire: "Locataire",
    proprietaire: "Propriétaire",
    heberge: "Hébergé à titre gratuit",
  };

  const champs: ChampRempli[] = cerfa.champs.map((c) => {
    switch (c.cle) {
      case "nom":
        return { cle: c.cle, valeur: profil.nom, confiance: "haute", source: "profil.nom" };
      case "prenom":
        return { cle: c.cle, valeur: profil.prenom, confiance: "haute", source: "profil.prenom" };
      case "email":
        return { cle: c.cle, valeur: profil.email, confiance: "haute", source: "profil.email" };
      case "situation":
        return {
          cle: c.cle,
          valeur: situationLabel[profil.situation],
          confiance: "haute",
          source: "profil.situation",
        };
      case "nb_enfants":
        return {
          cle: c.cle,
          valeur: String(profil.nombre_enfants),
          confiance: "haute",
          source: "profil.nombre_enfants",
        };
      case "revenus_3_mois":
        return {
          cle: c.cle,
          valeur: String(Math.round(profil.revenus_annuels / 4)),
          confiance: "moyenne",
          source: "profil.revenus_annuels / 4 (estimation)",
        };
      case "logement":
        return {
          cle: c.cle,
          valeur: logementLabel[profil.logement],
          confiance: "haute",
          source: "profil.logement",
        };
      case "code_postal":
        return {
          cle: c.cle,
          valeur: profil.code_postal,
          confiance: "haute",
          source: "profil.code_postal",
        };
      case "numero_fiscal":
        return {
          cle: c.cle,
          valeur: profil.numero_fiscal ?? "",
          confiance: profil.numero_fiscal ? "haute" : "faible",
          source: "profil.numero_fiscal",
        };
      case "salaires_nets":
        return {
          cle: c.cle,
          valeur: String(profil.revenus_annuels),
          confiance: "moyenne",
          source: "profil.revenus_annuels",
        };
      case "parts_fiscales": {
        const base = profil.situation === "celibataire" ? 1 : 2;
        const enfants = profil.nombre_enfants;
        const parts = base + (enfants <= 2 ? enfants * 0.5 : 1 + (enfants - 2));
        return {
          cle: c.cle,
          valeur: String(parts),
          confiance: "moyenne",
          source: "calculé depuis situation + nombre_enfants",
        };
      }
      default:
        return { cle: c.cle, valeur: "", confiance: "faible", source: "" };
    }
  });

  const alertes = champs
    .filter(
      (c) =>
        c.valeur === "" && cerfa.champs.find((cc) => cc.cle === c.cle)?.obligatoire,
    )
    .map((c) => `Champ obligatoire "${c.cle}" non rempli`);

  return {
    cerfa: { reference: cerfa.reference, titre: cerfa.titre, organisme: cerfa.organisme },
    champs,
    alertes,
  };
}
