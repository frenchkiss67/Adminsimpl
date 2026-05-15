# AdminSimpl

**Assistant d'automatisation des démarches administratives** — Remplissez, suivez et optimisez vos démarches auprès des organismes publics (impôts, CAF, aides locales) sans subir la lourdeur administrative.

## Concept

- **Pré-remplissage sécurisé** des formulaires officiels grâce à des agents IA spécialisés.
- **Alertes proactives** dès qu'une nouvelle aide est disponible pour votre profil.
- **Suivi unifié** de tous vos dossiers dans un tableau de bord clair.
- **RPA conforme** : soumission automatisée sur les portails officiels avec journal d'audit.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- Données mockées (`src/lib/mockData.ts`) — pas encore de backend

## Lancement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/
    page.tsx                  # Landing page
    profil/page.tsx           # Formulaire de création de profil (3 étapes)
    tableau-de-bord/page.tsx  # Dashboard des démarches et alertes
  components/                 # Header, Footer
  lib/mockData.ts             # Données simulées (démarches, alertes)
```

## Statut

MVP frontend uniquement — démarches et alertes simulées. Prochaine étape : API + agent Claude pour le parsing de formulaires.
