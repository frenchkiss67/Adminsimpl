import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let _db: Database.Database | null = null;

function db(): Database.Database {
  if (_db) return _db;
  const dataDir = process.env.ADMINSIMPL_DATA_DIR ?? path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const handle = new Database(path.join(dataDir, "adminsimpl.db"));
  handle.pragma("journal_mode = WAL");
  handle.pragma("foreign_keys = ON");
  handle.exec(SCHEMA);
  _db = handle;
  return handle;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS profils (
    id TEXT PRIMARY KEY,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    numero_fiscal TEXT,
    situation TEXT NOT NULL,
    nombre_enfants INTEGER NOT NULL DEFAULT 0,
    revenus_annuels INTEGER NOT NULL DEFAULT 0,
    logement TEXT NOT NULL,
    code_postal TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS demarches (
    id TEXT PRIMARY KEY,
    profil_id TEXT NOT NULL REFERENCES profils(id) ON DELETE CASCADE,
    titre TEXT NOT NULL,
    organisme TEXT NOT NULL,
    statut TEXT NOT NULL,
    echeance TEXT NOT NULL,
    montant_estime INTEGER,
    description TEXT NOT NULL,
    formulaire_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_demarches_profil ON demarches(profil_id);
`;

export type Profil = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  numero_fiscal: string | null;
  situation: "celibataire" | "couple" | "famille";
  nombre_enfants: number;
  revenus_annuels: number;
  logement: "locataire" | "proprietaire" | "heberge";
  code_postal: string;
  created_at: string;
  updated_at: string;
};

export type DemarcheRow = {
  id: string;
  profil_id: string;
  titre: string;
  organisme: string;
  statut: string;
  echeance: string;
  montant_estime: number | null;
  description: string;
  formulaire_json: string | null;
  created_at: string;
};

export function getProfilByEmail(email: string): Profil | undefined {
  return db().prepare("SELECT * FROM profils WHERE email = ?").get(email) as Profil | undefined;
}

export function getProfilById(id: string): Profil | undefined {
  return db().prepare("SELECT * FROM profils WHERE id = ?").get(id) as Profil | undefined;
}

export function upsertProfil(p: Omit<Profil, "created_at" | "updated_at">): Profil {
  db().prepare(
    `INSERT INTO profils (id, prenom, nom, email, numero_fiscal, situation, nombre_enfants, revenus_annuels, logement, code_postal)
     VALUES (@id, @prenom, @nom, @email, @numero_fiscal, @situation, @nombre_enfants, @revenus_annuels, @logement, @code_postal)
     ON CONFLICT(email) DO UPDATE SET
       prenom = excluded.prenom,
       nom = excluded.nom,
       numero_fiscal = excluded.numero_fiscal,
       situation = excluded.situation,
       nombre_enfants = excluded.nombre_enfants,
       revenus_annuels = excluded.revenus_annuels,
       logement = excluded.logement,
       code_postal = excluded.code_postal,
       updated_at = datetime('now')`,
  ).run(p);
  return getProfilByEmail(p.email)!;
}

export function listDemarches(profilId: string): DemarcheRow[] {
  return db()
    .prepare("SELECT * FROM demarches WHERE profil_id = ? ORDER BY echeance ASC")
    .all(profilId) as DemarcheRow[];
}

export function seedDemarchesFor(profilId: string) {
  const handle = db();
  const count = (
    handle.prepare("SELECT COUNT(*) AS n FROM demarches WHERE profil_id = ?").get(profilId) as {
      n: number;
    }
  ).n;
  if (count > 0) return;

  const insert = handle.prepare(
    `INSERT INTO demarches (id, profil_id, titre, organisme, statut, echeance, montant_estime, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const rows: Array<
    [titre: string, organisme: string, statut: string, echeance: string, montant: number | null, description: string]
  > = [
    [
      "Déclaration de revenus 2026",
      "Direction Générale des Finances Publiques",
      "pre-remplie",
      "2026-05-30",
      null,
      "Revenus salariés et fonciers récupérés. Vérifiez et signez pour soumettre.",
    ],
    [
      "Prime d'activité",
      "CAF",
      "a-valider",
      "2026-06-15",
      187,
      "Calcul effectué sur la base de votre dernier bulletin. À confirmer.",
    ],
    [
      "Aide au chauffage 2026 — Région PACA",
      "Conseil régional PACA",
      "nouvelle",
      "2026-09-30",
      300,
      "Nouvelle aide détectée pour votre profil. Éligibilité confirmée à 92 %.",
    ],
    [
      "Aide personnalisée au logement (APL)",
      "CAF",
      "soumise",
      "2026-04-10",
      245,
      "Dossier transmis. Premier versement attendu sous 21 jours.",
    ],
  ];
  const insertAll = handle.transaction(() => {
    rows.forEach((r, idx) => insert.run(`dem-${profilId}-${idx}`, profilId, ...r));
  });
  insertAll();
}

export default db;
