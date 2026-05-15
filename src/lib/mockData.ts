export type StatutDemarche = "pre-remplie" | "a-valider" | "soumise" | "validee" | "nouvelle";

export type Demarche = {
  id: string;
  titre: string;
  organisme: string;
  statut: StatutDemarche;
  echeance: string;
  montantEstime?: number;
  description: string;
};

export type Alerte = {
  id: string;
  titre: string;
  message: string;
  type: "nouvelle-aide" | "echeance" | "rappel";
  date: string;
};

export const demarchesMock: Demarche[] = [
  {
    id: "imp-2026",
    titre: "Déclaration de revenus 2026",
    organisme: "Direction Générale des Finances Publiques",
    statut: "pre-remplie",
    echeance: "2026-05-30",
    description:
      "Vos revenus salariés et fonciers ont été récupérés. Vérifiez et signez pour soumettre.",
  },
  {
    id: "caf-prime",
    titre: "Prime d'activité",
    organisme: "CAF",
    statut: "a-valider",
    echeance: "2026-06-15",
    montantEstime: 187,
    description: "Calcul effectué sur la base de votre dernier bulletin. À confirmer.",
  },
  {
    id: "paca-chauffage",
    titre: "Aide au chauffage 2026 — Région PACA",
    organisme: "Conseil régional PACA",
    statut: "nouvelle",
    echeance: "2026-09-30",
    montantEstime: 300,
    description: "Nouvelle aide détectée pour votre profil. Éligibilité confirmée à 92 %.",
  },
  {
    id: "caf-aps",
    titre: "Aide personnalisée au logement (APL)",
    organisme: "CAF",
    statut: "soumise",
    echeance: "2026-04-10",
    montantEstime: 245,
    description: "Dossier transmis. Premier versement attendu sous 21 jours.",
  },
  {
    id: "impots-cmu",
    titre: "Complémentaire santé solidaire",
    organisme: "Assurance Maladie",
    statut: "validee",
    echeance: "2026-01-15",
    description: "Dossier accepté. Droits ouverts jusqu'au 31/12/2026.",
  },
];

export const alertesMock: Alerte[] = [
  {
    id: "a1",
    titre: "Nouvelle aide détectée",
    message: "Vous êtes potentiellement éligible à l'aide chauffage PACA (≈ 300 €).",
    type: "nouvelle-aide",
    date: "2026-05-12",
  },
  {
    id: "a2",
    titre: "Échéance impôts dans 15 jours",
    message: "Votre déclaration est prête à être signée et soumise.",
    type: "echeance",
    date: "2026-05-15",
  },
  {
    id: "a3",
    titre: "Rappel CAF",
    message: "Pensez à confirmer la prime d'activité avant le 15/06.",
    type: "rappel",
    date: "2026-05-10",
  },
];

export const labelStatut: Record<StatutDemarche, { label: string; classe: string }> = {
  "pre-remplie": { label: "Pré-remplie", classe: "bg-emerald-50 text-emerald-700" },
  "a-valider": { label: "À valider", classe: "bg-amber-50 text-amber-700" },
  soumise: { label: "Soumise", classe: "bg-marine-50 text-marine-700" },
  validee: { label: "Validée", classe: "bg-slate-100 text-slate-700" },
  nouvelle: { label: "Nouvelle aide", classe: "bg-accent-500/10 text-accent-600" },
};
