# AdminSimpl

**Assistant d'automatisation des démarches administratives** — Application bureau Windows 100 % hors-ligne qui pré-remplit vos formulaires Cerfa, suit vos dossiers (impôts, CAF, aides locales) et vous alerte sur les aides disponibles.

## Fonctionnalités

- **Pré-remplissage Cerfa** — vos informations de profil sont mappées automatiquement vers les champs des formulaires officiels (prime d'activité, déclaration de revenus…) avec un score de confiance par champ.
- **Suivi unifié** — toutes vos démarches dans un tableau de bord avec filtres par statut et alertes proactives.
- **100 % hors-ligne** — aucune connexion réseau sortante. Vos données ne quittent jamais votre machine.

## Garantie hors-ligne — comment c'est verrouillé

| Couche | Mécanisme |
|---|---|
| Code applicatif | Aucune dépendance vers une API externe (le SDK Anthropic a été retiré). |
| Télémétrie Next.js | `NEXT_TELEMETRY_DISABLED=1` défini par le process Electron avant le spawn du serveur. |
| Renderer Chromium | CSP stricte `connect-src 'self'` + `default-src 'self'` injectée par Electron sur toutes les réponses. |
| Session Electron | `webRequest.onBeforeRequest` annule toute requête dont le host n'est pas `127.0.0.1` / `localhost` / `::1`. |
| Auto-updater | Non configuré, pas de check au démarrage. |

Pour auditer en live : ouvrir DevTools (Ctrl+Maj+I) → onglet Network → toutes les requêtes pointent sur `127.0.0.1:<port>`. Toute tentative externe apparaît `(blocked)` et est loggée dans la console.

## Stack

- **Electron** — application desktop multi-plateforme
- [Next.js 14](https://nextjs.org/) (App Router, mode `standalone`) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [SQLite via better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — module natif recompilé pour Electron

## Construire l'installeur Windows (.exe)

Sur une machine Windows avec [Node.js 20+](https://nodejs.org/) installé :

```cmd
git clone <repo>
cd Adminsimpl
npm install
npm run electron:build:win
```

L'installeur NSIS apparaît dans `dist-electron\AdminSimpl-Setup-0.1.0.exe`. Double-clic pour installer.

**Note 1 — outils de build :** `npm install` recompile `better-sqlite3` pour Electron via `node-gyp`. Si l'installation échoue, installer les outils de build :
```cmd
npm install --global windows-build-tools
```
(ou installer Visual Studio Build Tools manuellement avec le workload "Desktop development with C++" + Python 3 dans le PATH).

**Note 2 — icône :** par défaut, l'app utilise l'icône Electron. Pour personnaliser, placer un `icon.ico` (256×256) dans `build-resources/`.

## Développer

```bash
npm install
npm run electron:dev   # lance Next.js + Electron en parallèle, hot-reload activé
```

Ou en mode web pur (sans Electron) :
```bash
npm run dev            # → http://localhost:3000
```

## Où sont stockées les données ?

| Contexte | Chemin |
|---|---|
| Application installée (Windows) | `%APPDATA%\AdminSimpl\data\adminsimpl.db` |
| `npm run electron:dev` | `%APPDATA%\Electron\data\adminsimpl.db` |
| `npm run dev` (web pur) | `.data/adminsimpl.db` (dans le projet) |

Le dossier est créé automatiquement au premier lancement.

## Structure

```
electron/
  main.cjs                     # Process principal Electron (spawn du serveur Next standalone)
scripts/
  prepare-electron.cjs         # Copie .next/static et public/ dans .next/standalone/
src/
  app/
    page.tsx                   # Landing
    profil/page.tsx            # Formulaire 3 étapes
    tableau-de-bord/page.tsx   # Dashboard
    api/                       # Routes serveur (profil, demarches, parse-form)
  components/
    Header.tsx, Footer.tsx
    PreRemplissageModal.tsx    # Modale d'invocation de l'agent
  lib/
    db.ts                      # SQLite (respecte ADMINSIMPL_DATA_DIR)
    cerfa.ts                   # Catalogue de formulaires Cerfa
    mockData.ts                # Alertes et labels de statut
next.config.mjs                # output: 'standalone' pour packaging Electron
```

## Comment ça tourne en production

1. L'utilisateur lance `AdminSimpl.exe` (installé via NSIS).
2. Electron démarre, crée le dossier `%APPDATA%\AdminSimpl\data\` si absent.
3. Electron spawn `server.js` (Next.js standalone) sur un port libre local en passant `ADMINSIMPL_DATA_DIR` en variable d'environnement.
4. Une fois le serveur prêt, Electron ouvre une `BrowserWindow` sur `http://127.0.0.1:<port>/`.
5. Les API routes Next.js tournent dans ce process Node, et `db.ts` utilise le chemin fourni par Electron.
6. Le pré-remplissage Cerfa applique des règles déterministes (mapping profil → champs Cerfa, calcul des parts fiscales, conversion revenus annuels → trimestriels).

Tout est local : zéro connexion sortante, zéro télémétrie.
