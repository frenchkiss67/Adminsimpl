"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SituationFamiliale = "celibataire" | "couple" | "famille";
type Logement = "locataire" | "proprietaire" | "heberge";

type Profil = {
  prenom: string;
  nom: string;
  email: string;
  numeroFiscal: string;
  situation: SituationFamiliale;
  nombreEnfants: number;
  revenusAnnuels: number;
  logement: Logement;
  codePostal: string;
  consentRGPD: boolean;
};

const profilVide: Profil = {
  prenom: "",
  nom: "",
  email: "",
  numeroFiscal: "",
  situation: "celibataire",
  nombreEnfants: 0,
  revenusAnnuels: 0,
  logement: "locataire",
  codePostal: "",
  consentRGPD: false,
};

export default function ProfilPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<Profil>(profilVide);
  const [etape, setEtape] = useState(1);
  const totalEtapes = 3;

  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profil),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Échec de l'enregistrement");
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("adminsimpl:email", profil.email);
        window.localStorage.setItem("adminsimpl:prenom", profil.prenom);
      }
      router.push(`/tableau-de-bord?email=${encodeURIComponent(profil.email)}`);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setEnvoi(false);
    }
  };

  const update = <K extends keyof Profil>(cle: K, valeur: Profil[K]) => {
    setProfil((p) => ({ ...p, [cle]: valeur }));
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-marine-600">
          Étape {etape} sur {totalEtapes}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-marine-900">Créons votre profil sécurisé</h1>
        <p className="mt-2 text-slate-600">
          Ces informations restent chiffrées et ne servent qu'à pré-remplir vos démarches.
        </p>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-marine-600 transition-all"
            style={{ width: `${(etape / totalEtapes) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {etape === 1 && (
          <>
            <h2 className="text-lg font-semibold text-marine-900">Identité</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Champ
                label="Prénom"
                value={profil.prenom}
                onChange={(v) => update("prenom", v)}
                required
              />
              <Champ
                label="Nom"
                value={profil.nom}
                onChange={(v) => update("nom", v)}
                required
              />
              <Champ
                label="Email"
                type="email"
                value={profil.email}
                onChange={(v) => update("email", v)}
                required
              />
              <Champ
                label="Numéro fiscal (13 chiffres)"
                value={profil.numeroFiscal}
                onChange={(v) => update("numeroFiscal", v)}
                placeholder="Optionnel pour la démo"
              />
            </div>
          </>
        )}

        {etape === 2 && (
          <>
            <h2 className="text-lg font-semibold text-marine-900">Situation</h2>
            <Select
              label="Situation familiale"
              value={profil.situation}
              onChange={(v) => update("situation", v as SituationFamiliale)}
              options={[
                { value: "celibataire", label: "Célibataire" },
                { value: "couple", label: "En couple" },
                { value: "famille", label: "Famille" },
              ]}
            />
            <Champ
              label="Nombre d'enfants à charge"
              type="number"
              value={String(profil.nombreEnfants)}
              onChange={(v) => update("nombreEnfants", Number(v))}
            />
            <Select
              label="Logement"
              value={profil.logement}
              onChange={(v) => update("logement", v as Logement)}
              options={[
                { value: "locataire", label: "Locataire" },
                { value: "proprietaire", label: "Propriétaire" },
                { value: "heberge", label: "Hébergé" },
              ]}
            />
            <Champ
              label="Code postal"
              value={profil.codePostal}
              onChange={(v) => update("codePostal", v)}
              required
            />
          </>
        )}

        {etape === 3 && (
          <>
            <h2 className="text-lg font-semibold text-marine-900">Revenus & consentement</h2>
            <Champ
              label="Revenus annuels nets (€)"
              type="number"
              value={String(profil.revenusAnnuels)}
              onChange={(v) => update("revenusAnnuels", Number(v))}
            />
            <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={profil.consentRGPD}
                onChange={(e) => update("consentRGPD", e.target.checked)}
                required
              />
              <span>
                J'autorise AdminSimpl à pré-remplir mes formulaires officiels en mon nom et à
                conserver mes informations de manière chiffrée. Je peux retirer ce consentement à
                tout moment depuis mon espace personnel.
              </span>
            </label>
          </>
        )}

        <div className="flex justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setEtape((e) => Math.max(1, e - 1))}
            className="btn-secondary"
            disabled={etape === 1}
          >
            Précédent
          </button>
          {etape < totalEtapes ? (
            <button
              type="button"
              onClick={() => setEtape((e) => e + 1)}
              className="btn-primary"
            >
              Suivant
            </button>
          ) : (
            <button type="submit" disabled={envoi} className="btn-primary disabled:opacity-50">
              {envoi ? "Enregistrement…" : "Lancer l'analyse de mes droits"}
            </button>
          )}
        </div>
        {erreur && (
          <p className="text-sm text-red-600" role="alert">
            {erreur}
          </p>
        )}
      </form>
    </div>
  );
}

function Champ({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-marine-500 focus:outline-none focus:ring-1 focus:ring-marine-500"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-marine-500 focus:outline-none focus:ring-1 focus:ring-marine-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
