import Link from "next/link";
import { FranceConnectButton } from "@/components/FranceConnectButton";

const fonctionnalites = [
  {
    titre: "Pré-remplissage sécurisé",
    description:
      "Nos agents IA extraient les bonnes informations de votre dossier et complètent vos formulaires officiels en quelques secondes.",
    icone: "📝",
  },
  {
    titre: "Alertes proactives",
    description:
      "Dès qu'une nouvelle aide correspond à votre profil (CAF, locale, énergie), vous êtes prévenu avant la date limite.",
    icone: "🔔",
  },
  {
    titre: "Suivi unifié",
    description:
      "Tous vos dossiers (impôts, CAF, aides locales) regroupés dans un tableau de bord clair avec leur statut en temps réel.",
    icone: "📊",
  },
  {
    titre: "RPA conforme",
    description:
      "Soumission automatisée sur les portails officiels avec un journal d'audit complet. Vos données restent chiffrées.",
    icone: "🔒",
  },
];

const tarifs = [
  {
    nom: "Découverte",
    prix: "Gratuit",
    description: "1 démarche simple par mois",
    avantages: ["Pré-remplissage basique", "Alertes mensuelles", "Support communautaire"],
    cta: "Essayer",
    highlight: false,
  },
  {
    nom: "Sérénité annuelle",
    prix: "49 €/an",
    description: "Démarches illimitées toute l'année",
    avantages: [
      "Pré-remplissage avancé",
      "Alertes proactives en temps réel",
      "Support prioritaire",
      "Coffre-fort numérique",
    ],
    cta: "Choisir Sérénité",
    highlight: true,
  },
  {
    nom: "À la démarche",
    prix: "Dès 9 €",
    description: "Paiement à l'unité pour les cas complexes",
    avantages: ["Accompagnement personnalisé", "Garantie satisfaction", "Conseiller dédié"],
    cta: "Voir le catalogue",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-marine-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-marine-100 px-3 py-1 text-xs font-semibold text-marine-700">
              Nouveau · Aides 2026 déjà intégrées
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-marine-900 md:text-5xl">
              Vos démarches administratives, enfin sans friction.
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              AdminSimpl pré-remplit vos formulaires officiels, suit l'avancement de vos dossiers et
              vous alerte dès qu'une nouvelle aide est disponible pour votre profil.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/profil" className="btn-primary">
                Créer mon profil gratuit
              </Link>
              <FranceConnectButton />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              <Link href="#fonctionnalites" className="hover:text-marine-600">
                Voir les fonctionnalités →
              </Link>
            </p>
            <p className="mt-6 text-xs text-slate-500">
              Données chiffrées de bout en bout · Hébergement en France · Conforme RGPD
            </p>
          </div>
          <div className="relative">
            <div className="card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-marine-900">Aperçu — Vos démarches</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  3 actives
                </span>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span>Déclaration de revenus 2026</span>
                  <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                    Pré-remplie
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Prime d'activité — CAF</span>
                  <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                    À valider
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Aide chauffage région PACA</span>
                  <span className="rounded bg-marine-50 px-2 py-1 text-xs text-marine-700">
                    Nouvelle aide
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-marine-900">Ce que fait AdminSimpl pour vous</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Une équipe d'agents IA spécialisés gère la complexité, vous gardez le contrôle.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {fonctionnalites.map((f) => (
            <div key={f.titre} className="card">
              <div className="text-3xl">{f.icone}</div>
              <h3 className="mt-3 text-lg font-semibold text-marine-900">{f.titre}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tarifs" className="bg-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-marine-900">Une formule adaptée à votre rythme</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Sans engagement, résiliable à tout moment. Garantie satisfait ou remboursé sous 30 jours.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {tarifs.map((t) => (
              <div
                key={t.nom}
                className={`card flex flex-col ${
                  t.highlight ? "border-marine-600 ring-2 ring-marine-600" : ""
                }`}
              >
                {t.highlight && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">
                    Plus populaire
                  </span>
                )}
                <h3 className="text-lg font-semibold text-marine-900">{t.nom}</h3>
                <p className="mt-1 text-2xl font-bold text-marine-700">{t.prix}</p>
                <p className="mt-1 text-sm text-slate-600">{t.description}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                  {t.avantages.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-emerald-500">✓</span>
                      {a}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/profil"
                  className={`mt-6 ${t.highlight ? "btn-primary" : "btn-secondary"}`}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-marine-900">
          Reprenez le contrôle de vos démarches en 5 minutes.
        </h2>
        <p className="mt-4 text-slate-600">
          Créez votre profil sécurisé, AdminSimpl s'occupe du reste.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/profil" className="btn-primary">
            Démarrer maintenant
          </Link>
          <Link href="/tableau-de-bord" className="btn-secondary">
            Voir une démo
          </Link>
        </div>
      </section>
    </>
  );
}
