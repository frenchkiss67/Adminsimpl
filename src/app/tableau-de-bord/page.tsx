"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { alertesMock, demarchesMock, labelStatut, type Demarche } from "@/lib/mockData";

type FiltreStatut = "tous" | Demarche["statut"];

export default function TableauDeBordPage() {
  const [filtre, setFiltre] = useState<FiltreStatut>("tous");
  const [prenom, setPrenom] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("adminsimpl:profil");
    if (raw) {
      try {
        const p = JSON.parse(raw) as { prenom?: string };
        if (p.prenom) setPrenom(p.prenom);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const demarchesFiltrees = useMemo(() => {
    if (filtre === "tous") return demarchesMock;
    return demarchesMock.filter((d) => d.statut === filtre);
  }, [filtre]);

  const stats = useMemo(() => {
    const total = demarchesMock.length;
    const enCours = demarchesMock.filter((d) =>
      ["pre-remplie", "a-valider", "soumise", "nouvelle"].includes(d.statut),
    ).length;
    const economies = demarchesMock.reduce((acc, d) => acc + (d.montantEstime ?? 0), 0);
    return { total, enCours, economies };
  }, []);

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
        <Link href="/profil" className="btn-secondary">
          Modifier mon profil
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Démarches actives" valeur={String(stats.enCours)} sousTexte={`sur ${stats.total} dossiers`} />
        <StatCard
          label="Montant estimé annuel"
          valeur={`${stats.economies} €`}
          sousTexte="aides cumulables"
        />
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
            {demarchesFiltrees.length === 0 ? (
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
              <button className="mt-3 text-xs font-semibold text-marine-600 hover:text-marine-700">
                Voir le détail →
              </button>
            </div>
          ))}
        </aside>
      </div>
    </div>
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

function DemarcheCard({ demarche }: { demarche: Demarche }) {
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
        {demarche.montantEstime ? (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
            ≈ {demarche.montantEstime} €
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn-primary text-xs">Ouvrir la démarche</button>
        <button className="btn-secondary text-xs">Voir le formulaire pré-rempli</button>
      </div>
    </article>
  );
}
