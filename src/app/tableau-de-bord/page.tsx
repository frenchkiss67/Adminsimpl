"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { alertesMock, labelStatut, type Demarche, type StatutDemarche } from "@/lib/mockData";
import { PreRemplissageModal } from "@/components/PreRemplissageModal";

type FiltreStatut = "tous" | Demarche["statut"];

type DemarcheApi = {
  id: string;
  titre: string;
  organisme: string;
  statut: StatutDemarche;
  echeance: string;
  montant_estime: number | null;
  description: string;
};

function TableauContenu() {
  const params = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [prenom, setPrenom] = useState<string | null>(null);
  const [demarches, setDemarches] = useState<DemarcheApi[]>([]);
  const [filtre, setFiltre] = useState<FiltreStatut>("tous");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [modaleOuverte, setModaleOuverte] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const emailParam = params.get("email");
    const emailStocke = window.localStorage.getItem("adminsimpl:email");
    const e = emailParam ?? emailStocke;
    if (e) {
      setEmail(e);
      window.localStorage.setItem("adminsimpl:email", e);
    }
    setPrenom(window.localStorage.getItem("adminsimpl:prenom"));
  }, [params]);

  useEffect(() => {
    if (!email) {
      setChargement(false);
      return;
    }
    setChargement(true);
    setErreur(null);
    Promise.all([
      fetch(`/api/profil?email=${encodeURIComponent(email)}`),
      fetch(`/api/demarches?email=${encodeURIComponent(email)}`),
    ])
      .then(async ([rProfil, rDem]) => {
        if (!rProfil.ok) throw new Error("Profil introuvable");
        if (!rDem.ok) throw new Error("Démarches indisponibles");
        const profil = (await rProfil.json()).profil;
        const dem = (await rDem.json()).demarches;
        if (profil.prenom) {
          setPrenom(profil.prenom);
          window.localStorage.setItem("adminsimpl:prenom", profil.prenom);
        }
        setDemarches(dem);
      })
      .catch((e) => setErreur(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setChargement(false));
  }, [email]);

  const demarchesFiltrees = useMemo(() => {
    if (filtre === "tous") return demarches;
    return demarches.filter((d) => d.statut === filtre);
  }, [demarches, filtre]);

  const stats = useMemo(() => {
    const total = demarches.length;
    const enCours = demarches.filter((d) =>
      ["pre-remplie", "a-valider", "soumise", "nouvelle"].includes(d.statut),
    ).length;
    const economies = demarches.reduce((acc, d) => acc + (d.montant_estime ?? 0), 0);
    return { total, enCours, economies };
  }, [demarches]);

  if (!email) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-marine-900">Aucun profil détecté</h1>
        <p className="mt-3 text-slate-600">
          Créez votre profil pour accéder à votre tableau de bord personnalisé.
        </p>
        <Link href="/profil" className="btn-primary mt-6 inline-flex">
          Créer mon profil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-marine-900">
            Bonjour{prenom ? `, ${prenom}` : ""} 👋
          </h1>
          <p className="mt-2 text-slate-600">
            Voici l'état de vos démarches et les aides détectées par notre IA.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModaleOuverte(true)} className="btn-primary">
            Pré-remplir un Cerfa
          </button>
          <Link href="/profil" className="btn-secondary">
            Modifier mon profil
          </Link>
        </div>
      </div>

      {erreur && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Démarches actives" valeur={String(stats.enCours)} sousTexte={`sur ${stats.total} dossiers`} />
        <StatCard label="Montant estimé annuel" valeur={`${stats.economies} €`} sousTexte="aides cumulables" />
        <StatCard label="Alertes nouvelles" valeur={String(alertesMock.length)} sousTexte="à traiter" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-marine-900">Mes démarches</h2>
            <div className="flex flex-wrap gap-2">
              {(["tous", "pre-remplie", "a-valider", "soumise", "nouvelle", "validee"] as FiltreStatut[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltre(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filtre === f
                      ? "bg-marine-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {f === "tous" ? "Tous" : labelStatut[f].label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {chargement ? (
              <p className="card text-sm text-slate-500">Chargement…</p>
            ) : demarchesFiltrees.length === 0 ? (
              <p className="card text-sm text-slate-500">Aucune démarche dans cette catégorie.</p>
            ) : (
              demarchesFiltrees.map((d) => <DemarcheCard key={d.id} demarche={d} />)
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <h2 className="text-xl font-semibold text-marine-900">Alertes proactives</h2>
          {alertesMock.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-marine-900">{a.titre}</h3>
                <span className="text-xs text-slate-400">
                  {new Date(a.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{a.message}</p>
            </div>
          ))}
        </aside>
      </div>

      {modaleOuverte && email && (
        <PreRemplissageModal email={email} onClose={() => setModaleOuverte(false)} />
      )}
    </div>
  );
}

export default function TableauDeBordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-12">Chargement…</div>}>
      <TableauContenu />
    </Suspense>
  );
}

function StatCard({
  label,
  valeur,
  sousTexte,
}: {
  label: string;
  valeur: string;
  sousTexte: string;
}) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-marine-900">{valeur}</p>
      <p className="mt-1 text-xs text-slate-500">{sousTexte}</p>
    </div>
  );
}

function DemarcheCard({ demarche }: { demarche: DemarcheApi }) {
  const statut = labelStatut[demarche.statut];
  return (
    <article className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-marine-900">{demarche.titre}</h3>
          <p className="text-xs text-slate-500">{demarche.organisme}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statut.classe}`}>
          {statut.label}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{demarche.description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          Échéance :{" "}
          <strong className="text-slate-700">
            {new Date(demarche.echeance).toLocaleDateString("fr-FR")}
          </strong>
        </span>
        {demarche.montant_estime ? (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
            ≈ {demarche.montant_estime} €
          </span>
        ) : null}
      </div>
    </article>
  );
}
