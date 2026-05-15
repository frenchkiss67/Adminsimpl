# AdminSimpl

**Assistant d'automatisation des démarches administratives** — Remplissez, suivez et optimisez vos démarches auprès des organismes publics (impôts, CAF, aides locales) sans subir la lourdeur administrative.

## Fonctionnalités

- **Pré-remplissage Cerfa par IA** — un agent Claude analyse votre profil et complète les champs des formulaires officiels (prime d'activité, déclaration de revenus…) avec un score de confiance par champ.
- **Connexion FranceConnect** (mock OIDC simulé) — importez votre identité officielle pour ne rien ressaisir.
- **Suivi unifié** — toutes vos démarches dans un tableau de bord, avec filtres par statut et alertes proactives.
- **Persistance SQLite** — profils et démarches stockés localement.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [SQLite via better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript) — agent `claude-opus-4-7` avec adaptive thinking, prompt caching et structured outputs (Zod)

## Lancement

```bash
npm install
# Optionnel : pour activer l'agent Claude réel (sinon mode fallback déterministe)
export ANTHROPIC_API_KEY="sk-ant-..."
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/
    page.tsx                              # Landing
    profil/page.tsx                       # Formulaire 3 étapes (avec bouton FranceConnect)
    tableau-de-bord/page.tsx              # Dashboard (consomme les API)
    franceconnect/page.tsx                # Mock IdP — sélection d'identité simulée
    api/
      profil/route.ts                     # POST + GET profil
      demarches/route.ts                  # GET démarches d'un profil
      parse-form/route.ts                 # POST → agent Claude pré-remplit un Cerfa
      franceconnect/callback/route.ts     # OIDC callback simulé
  components/
    Header.tsx, Footer.tsx
    FranceConnectButton.tsx               # Bouton officiel-like
    PreRemplissageModal.tsx               # Modale d'invocation de l'agent
  lib/
    db.ts                                 # Schéma SQLite + helpers
    cerfa.ts                              # Catalogue de formulaires Cerfa supportés
    mockData.ts                           # Alertes et labels de statut (UI)
```

## Modèle de données

Tables `profils` et `demarches` (`.data/adminsimpl.db`, créé au premier démarrage). Foreign key + index sur `profil_id`.

## Agent Claude — détails techniques

Le endpoint `POST /api/parse-form` :
1. Construit un prompt système avec règles strictes (pas d'invention, format de sortie contrôlé, mention des sources)
2. Cache la définition du Cerfa (≈ 1024+ tokens stables) via `cache_control: { type: "ephemeral" }`
3. Appelle `client.messages.parse()` avec `output_config.format = zodOutputFormat(schema)` pour garantir un JSON conforme
4. Renvoie les champs avec confiance + source, plus une liste d'alertes

Si `ANTHROPIC_API_KEY` n'est pas défini, un fallback déterministe produit la même structure de réponse (mode démo).

## Statut

MVP fonctionnel — frontend + API + DB + agent IA + auth simulée. Prochaines étapes envisageables : vraie intégration FranceConnect (OIDC officiel), parsing de PDF Cerfa réels (Files API + vision), soumission RPA sur portails publics.
