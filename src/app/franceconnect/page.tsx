"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type IdentitePivot = {
  sub: string;
  given_name: string;
  family_name: string;
  email: string;
  birthdate: string;
  birthplace: string;
};

const IDENTITES: IdentitePivot[] = [
  {
    sub: "fc-dem-001",
    given_name: "Camille",
    family_name: "Martin",
    email: "camille.martin@example.fr",
    birthdate: "1989-04-12",
    birthplace: "Lyon",
  },
  {
    sub: "fc-dem-002",
    given_name: "Léa",
    family_name: "Dubois",
    email: "lea.dubois@example.fr",
    birthdate: "1995-11-23",
    birthplace: "Bordeaux",
  },
  {
    sub: "fc-dem-003",
    given_name: "Thomas",
    family_name: "Petit",
    email: "thomas.petit@example.fr",
    birthdate: "1978-07-04",
    birthplace: "Strasbourg",
  },
];

export default function FranceConnectPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-12">Chargement…</div>}>
      <FranceConnectMockContent />
    </Suspense>
  );
}

function FranceConnectMockContent() {
  const router = useRouter();
  const params = useSearchParams();
  const state = params.get("state") ?? "";
  const redirect = params.get("redirect_uri") ?? "/api/franceconnect/callback";
  const [selectionne, setSelectionne] = useState<string | null>(null);

  const valider = () => {
    const identite = IDENTITES.find((i) => i.sub === selectionne);
    if (!identite) return;
    const code = btoa(JSON.stringify(identite));
    const url = new URL(redirect, window.location.origin);
    url.searchParams.set("code", code);
    url.searchParams.set("state", state);
    router.push(url.pathname + url.search);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-marine-600 font-bold text-white">
            FC
          </span>
          <div>
            <h1 className="text-xl font-bold text-marine-900">FranceConnect — Simulation</h1>
            <p className="text-xs text-slate-500">
              Démo non officielle · Aucune donnée réelle utilisée
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-700">
          Choisissez un compte simulé pour vous connecter à AdminSimpl. En production, vous seriez
          redirigé vers <strong>franceconnect.gouv.fr</strong>.
        </p>
        <ul className="mt-6 space-y-3">
          {IDENTITES.map((i) => (
            <li key={i.sub}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                  selectionne === i.sub
                    ? "border-marine-600 bg-marine-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="identite"
                  value={i.sub}
                  checked={selectionne === i.sub}
                  onChange={() => setSelectionne(i.sub)}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className="font-semibold text-marine-900">
                    {i.given_name} {i.family_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Né(e) le {new Date(i.birthdate).toLocaleDateString("fr-FR")} à {i.birthplace}
                  </p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  Impôts
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-between gap-3">
          <button onClick={() => router.push("/")} className="btn-secondary">
            Annuler
          </button>
          <button onClick={valider} disabled={!selectionne} className="btn-primary disabled:opacity-50">
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
