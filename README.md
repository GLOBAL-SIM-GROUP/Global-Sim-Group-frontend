# GLOBAL SIM GROUP — SIM · Frontend

Client web de la plateforme multiservice **GLOBAL SIM GROUP — SIM** :
résidence, market, pressing, restaurant, salle de fête, facturation,
finances, RH et administration.

> **État actuel — fondation uniquement.** Ce dépôt contient l'architecture,
> l'authentification JWT, le système de permissions, la couche API générée
> depuis la spec OpenAPI réelle. L'interface est en français (texte en dur).
> **Aucune fonctionnalité métier n'est implémentée** (contrainte de la spec
> `prompt-adapted.md` §« IMPORTANT ») — les 12 modules (M0–M11) seront
> construits par-dessus cette fondation.

## Stack

```text
React 19
TanStack Router
TanStack Query
TanStack Form
TanStack Table
shadcn/ui
Biome
TypeScript
npm
```

## Architecture

```text
src/
  routes/        TanStack Router (file-based routing, guards beforeLoad)
  features/      un dossier par module métier (M0–M11) — vide tant que la fondation
                 ne l'exige pas
  core/          couche réutilisable, sans dépendance feature :
                   api/      client HTTP + types générés (OpenAPI)
                   auth/     session JWT, guards, AuthProvider
                   permissions/  modèle de permissions (UX only)
                   query/    singleton TanStack Query + conventions de clés
  components/    ui/ (shadcn) + layout/ (coquille applicative)
```

Voir [`docs/architecture.md`](docs/architecture.md).

## Relation avec le backend

```text
Frontend
    ↓ HTTP + JWT bearer
NestJS backend (sim-backend) — /api/v1
    ↓
PostgreSQL (sim-database, schéma par module)
```

```text
JWT auth
    ↓
login / refresh / logout / me
```

Instance dev déployée : `https://dev.sim.strife-cyber.org`.

- Tous les appels passent par le wrapper [`core/api/http.ts`](src/core/api/http.ts) :
  bearer automatique (sauf `/auth/login` et `/auth/refresh`), enveloppe d'erreur
  normalisée, **refresh-on-401** single-flight.
- Les tokens vivent **en mémoire** (décision produit) ; la session est perdue au
  reload, jamais persistée en `localStorage`.
- Le modèle de permissions reflète le backend réel (`MODULE.{VOIR,CREER,MODIFIER}`,
  13 préfixes, pas de `DELETE`) ; l'UI n'affiche que ce que `/auth/me` retourne.
- Voir [`docs/api.md`](docs/api.md) et [`docs/authentication.md`](docs/authentication.md).

## Langue

L'interface est **en français uniquement** : les libellés sont écrits
directement dans les composants, sans couche de traduction FR/EN (Paraglide a
été retiré). Les identifiants de code restent en anglais (camelCase).

## Développement

```bash
npm install
npm run dev          # serveur dev — http://localhost:3000
```

Qualité (scripts réels) :

```bash
npm run check        # Biome (lint + format) + typecheck TypeScript
npm test             # Vitest (tests unitaires + intégration login)
npm run build        # build production
```

Scripts utiles :

```bash
npm run generate-routes   # régénère src/routeTree.gen.ts
npm run api:gen           # régénère le client OpenAPI depuis la spec live
npm run typecheck         # tsc --noEmit
npm run lint / format     # Biome seul
```

## Docker (production)

Build multi-stage (`Dockerfile`) : image minimale `node:22-alpine`, rendu SSR
via `server.mjs` (hôte `node:http` + serveur statique pour `dist/client/`).

```bash
docker compose up --build     # → http://localhost:3004
# ou, sans Compose :
docker build -t sim-frontend .
docker run -p 3004:3000 sim-frontend
```

Le port hôte du compose est `3004` (3000 est capturé par WSL sur cette machine).
Le port **interne** du container reste `3000` (`PORT`), aussi piloté par
`server.mjs` (`PORT` env, défaut 3000) : seul le mapping hôte change.

- `VITE_API_URL` est **inliné au build** (variable Vite), défaut `/api/v1`
  (même origine). Le serveur relaie `/api/*` vers le backend via
  `API_TARGET` (env du container) — le navigateur n'appelle que la même
  origine, le CORS du backend ne s'applique pas. `docker compose` passe
  `API_TARGET` (instance de dev par défaut) ; en déploiement réel, régler
  cette variable sur l'URL du backend de production.
- `PORT` (défaut `3000`) pilote le port du serveur.
- Aucun secret dans l'image : `.dockerignore` exclut `.env*` et `node_modules`.

## Configuration d'environnement

Copier `.env.example` en `.env.local` et ajuster si besoin :

```env
# Base URL du backend. Non-secret : exposé au navigateur.
# Relative (même origine, défaut — en dev, Vite relaie /api/* vers le backend)
# ou absolue si le frontend est hébergé sur un autre domaine.
VITE_API_URL=/api/v1
```

`VITE_API_URL` est typé par `src/env.ts` (validation Zod : chemin relative ou URL absolue). En développement, le proxy du `vite.config.ts` relaie `/api/*` vers `https://dev.sim.strife-cyber.org` — le CORS du backend refuse `localhost:*`, un appel direct depuis le navigateur serait bloqué.

## Génération de l'API

Le client est **généré, jamais écrit à la main** :

1. `npm run api:gen` télécharge la spec live `https://dev.sim.strife-cyber.org/docs-json`
   (snapshot gitignoré dans `scripts/openapi.latest.json`).
2. `openapi-typescript` produit `src/core/api/generated/schema.ts` (commité).
3. Les types de réponse, l'enveloppe d'erreur et les permissions — **absents de la
   spec** — sont typés à la main dans `src/core/api/types.ts`, avec source citée.

Ne jamais éditer `src/core/api/generated/**` ni `src/routeTree.gen.ts` à la main —
les régénérer avec les scripts ci-dessus.

## Règles d'architecture

- [`docs/architecture.md`](docs/architecture.md) — couches et frontières
- [`docs/api.md`](docs/api.md) — backend réel, wrapper, enveloppe d'erreur
- [`docs/authentication.md`](docs/authentication.md) — JWT, rotation, stockage mémoire
- [`docs/authorization.md`](docs/authorization.md) — permissions depuis `/me`
- [`docs/routing.md`](docs/routing.md) — routes, guards, 404/erreurs
- [`docs/state-management.md`](docs/state-management.md) — Query vs state vs URL vs Form
- [`docs/testing.md`](docs/testing.md) — pyramide de tests, outils installés
- [`docs/components.md`](docs/components.md) — composants shadcn + layout
- [`docs/security.md`](docs/security.md) — règles de sécurité frontend
- [`docs/conventions.md`](docs/conventions.md) — conventions de code
- [`docs/development.md`](docs/development.md) — commandes et workflow
