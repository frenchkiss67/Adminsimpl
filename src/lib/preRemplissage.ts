export type ChampRempli = {
  cle: string;
  valeur: string;
  confiance: "haute" | "moyenne" | "faible";
  source: string;
};

export type PreRemplissage = {
  cerfa: { reference: string; titre: string; organisme: string };
  champs: ChampRempli[];
  alertes: string[];
};
