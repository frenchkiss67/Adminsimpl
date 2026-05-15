export type ChampCerfa = {
  cle: string;
  libelle: string;
  type: "texte" | "nombre" | "date" | "choix" | "email" | "code_postal";
  obligatoire: boolean;
  description: string;
  choix?: string[];
};

export type Cerfa = {
  reference: string;
  titre: string;
  organisme: string;
  description: string;
  champs: ChampCerfa[];
};

export const CERFA_CATALOGUE: Record<string, Cerfa> = {
  "15481-04": {
    reference: "Cerfa 15481*04",
    titre: "Demande de prime d'activité",
    organisme: "CAF",
    description:
      "Formulaire de demande de prime d'activité auprès de la Caisse d'Allocations Familiales.",
    champs: [
      { cle: "nom", libelle: "Nom de naissance", type: "texte", obligatoire: true, description: "Nom de famille tel qu'il figure sur l'état civil." },
      { cle: "prenom", libelle: "Prénom usuel", type: "texte", obligatoire: true, description: "Premier prénom de l'état civil." },
      { cle: "email", libelle: "Adresse électronique", type: "email", obligatoire: true, description: "Pour la correspondance dématérialisée." },
      { cle: "situation", libelle: "Situation familiale", type: "choix", obligatoire: true, choix: ["Célibataire", "En couple", "Marié(e) / Pacsé(e)"], description: "Situation au 1er janvier." },
      { cle: "nb_enfants", libelle: "Nombre d'enfants à charge", type: "nombre", obligatoire: true, description: "Enfants de moins de 25 ans à charge fiscale." },
      { cle: "revenus_3_mois", libelle: "Revenus nets des 3 derniers mois (€)", type: "nombre", obligatoire: true, description: "Total des salaires, indemnités et pensions perçus sur les 3 derniers mois civils." },
      { cle: "logement", libelle: "Type de logement", type: "choix", obligatoire: true, choix: ["Locataire", "Propriétaire", "Hébergé à titre gratuit"], description: "Statut d'occupation du logement principal." },
      { cle: "code_postal", libelle: "Code postal du domicile", type: "code_postal", obligatoire: true, description: "Code postal de la résidence principale." },
    ],
  },
  "14011-03": {
    reference: "Cerfa 14011*03",
    titre: "Déclaration de revenus simplifiée",
    organisme: "DGFiP",
    description: "Formulaire 2042 simplifié pour la déclaration des revenus annuels.",
    champs: [
      { cle: "numero_fiscal", libelle: "Numéro fiscal (13 chiffres)", type: "texte", obligatoire: true, description: "Numéro figurant sur votre avis d'imposition précédent." },
      { cle: "nom", libelle: "Nom", type: "texte", obligatoire: true, description: "Nom de famille du déclarant principal." },
      { cle: "prenom", libelle: "Prénom", type: "texte", obligatoire: true, description: "Prénom du déclarant principal." },
      { cle: "salaires_nets", libelle: "Salaires et traitements nets imposables (€)", type: "nombre", obligatoire: true, description: "Montant annuel des salaires nets imposables (case 1AJ)." },
      { cle: "parts_fiscales", libelle: "Nombre de parts fiscales", type: "nombre", obligatoire: true, description: "Calculé selon situation et personnes à charge." },
      { cle: "code_postal", libelle: "Code postal", type: "code_postal", obligatoire: true, description: "Code postal du domicile fiscal au 1er janvier." },
    ],
  },
};
