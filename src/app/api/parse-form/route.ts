import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
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
  mode: "claude" | "fallback";
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const reponse: Reponse = apiKey
    ? await preRemplirAvecClaude(profil, cerfa)
    : preRemplirDeterministe(profil, cerfa);

  return NextResponse.json(reponse);
}

async function preRemplirAvecClaude(profil: Profil, cerfa: Cerfa): Promise<Reponse> {
  const client = new Anthropic();

  const ChampSchema = z.object({
    cle: z.string(),
    valeur: z.string(),
    confiance: z.enum(["haute", "moyenne", "faible"]),
    source: z.string(),
  });
  const SortieSchema = z.object({
    champs: z.array(ChampSchema),
    alertes: z.array(z.string()),
  });

  const systeme = [
    {
      type: "text" as const,
      text: `Tu es un assistant administratif français. Ton rôle est de pré-remplir des formulaires Cerfa à partir d'un profil utilisateur.
Règles strictes :
- N'invente JAMAIS de données absentes du profil. Si l'information manque, retourne valeur="" et confiance="faible".
- Adapte le format : code postal sur 5 chiffres, choix EXACTEMENT comme listés dans le champ "choix", nombres sans espace.
- Le revenu annuel du profil doit être converti en revenu 3 mois (÷ 4) si le formulaire le demande.
- "source" doit citer le champ du profil utilisé (ex: "profil.revenus_annuels / 4").
- Place une alerte si un champ obligatoire reste vide.`,
    },
    {
      type: "text" as const,
      text: `Définition du formulaire Cerfa cible :\n${JSON.stringify(cerfa, null, 2)}`,
      cache_control: { type: "ephemeral" as const },
    },
  ];

  const message = await client.messages.parse({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    output_config: { format: zodOutputFormat(SortieSchema) },
    system: systeme,
    messages: [
      {
        role: "user",
        content: `Pré-remplis le formulaire avec ce profil :\n${JSON.stringify(
          {
            prenom: profil.prenom,
            nom: profil.nom,
            email: profil.email,
            numero_fiscal: profil.numero_fiscal,
            situation: profil.situation,
            nombre_enfants: profil.nombre_enfants,
            revenus_annuels: profil.revenus_annuels,
            logement: profil.logement,
            code_postal: profil.code_postal,
          },
          null,
          2,
        )}`,
      },
    ],
  });

  const sortie = message.parsed_output;
  if (!sortie) {
    return {
      ...preRemplirDeterministe(profil, cerfa),
      alertes: ["Réponse Claude non parsable, fallback déterministe utilisé."],
    };
  }

  return {
    cerfa: { reference: cerfa.reference, titre: cerfa.titre, organisme: cerfa.organisme },
    champs: sortie.champs,
    alertes: sortie.alertes,
    mode: "claude",
  };
}

function preRemplirDeterministe(profil: Profil, cerfa: Cerfa): Reponse {
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
    mode: "fallback",
  };
}
