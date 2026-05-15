"use client";

import { useState } from "react";

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

const COULEUR_CONFIANCE: Record<ChampRempli["confiance"], string> = {
  haute: "bg-emerald-50 text-emerald-700",
  moyenne: "bg-amber-50 text-amber-700",
  faible: "bg-red-50 text-red-700",
};

export function PreRemplissageModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [cerfaRef, setCerfaRef] = useState("15481-04");
  const [chargement, setChargement] = useState(false);
  const [reponse, setReponse] = useState<Reponse | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const lancer = async () => {
    setChargement(true);
    setErreur(null);
    setReponse(null);
    try {
      const res = await fetch("/api/parse-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cerfaRef }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec");
      setReponse(data);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-marine-900">Pré-remplissage Cerfa</h2>
            <p className="mt-1 text-sm text-slate-600">
              Notre agent IA analyse votre profil et complète les champs du formulaire.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Fermer">
            ×
          </button>
        </div>

        <div className="space-y-4 p-6">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Formulaire</span>
            <select
              value={cerfaRef}
              onChange={(e) => setCerfaRef(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="15481-04">Cerfa 15481*04 — Prime d'activité (CAF)</option>
              <option value="14011-03">Cerfa 14011*03 — Déclaration de revenus (DGFiP)</option>
            </select>
          </label>

          <button onClick={lancer} disabled={chargement} className="btn-primary disabled:opacity-50">
            {chargement ? "Analyse en cours…" : "Lancer le pré-remplissage"}
          </button>

          {erreur && (
            <p className="text-sm text-red-600" role="alert">
              {erreur}
            </p>
          )}

          {reponse && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-marine-900">
                  {reponse.cerfa.reference} — {reponse.cerfa.titre}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    reponse.mode === "claude"
                      ? "bg-marine-100 text-marine-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {reponse.mode === "claude" ? "Agent Claude" : "Mode démo"}
                </span>
              </div>

              {reponse.alertes.length > 0 && (
                <ul className="space-y-1 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  {reponse.alertes.map((a, i) => (
                    <li key={i}>⚠ {a}</li>
                  ))}
                </ul>
              )}

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-slate-500">
                    <th className="pb-2">Champ</th>
                    <th className="pb-2">Valeur</th>
                    <th className="pb-2">Confiance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reponse.champs.map((c) => (
                    <tr key={c.cle} className="align-top">
                      <td className="py-2 pr-2 font-medium text-slate-700">{c.cle}</td>
                      <td className="py-2 pr-2 text-slate-900">
                        {c.valeur || <em className="text-slate-400">vide</em>}
                        {c.source && (
                          <p className="mt-0.5 text-xs text-slate-500">↳ {c.source}</p>
                        )}
                      </td>
                      <td className="py-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${COULEUR_CONFIANCE[c.confiance]}`}
                        >
                          {c.confiance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
