# Architecture

## Vue d'ensemble

Application **TanStack Start** (React 19 + TypeScript 6 + Vite 8), client-only :
elle consomme le backend NestJS de GLOBAL SIM GROUP par HTTP + JWT. Aucun code
serveur d'application n'est écrit ici (pas de `serverMiddleware`, pas de base de
données) — le rendu SSR est utilisé par le framework pour la structure HTML.

```
┌─────────────────────────────────────────────────────────┐
│  src/routes/         colle de routing (guards, layouts)  │
│  src/features/       (vide) fonctionnalités métier        │
│  src/components/     ui/ (shadcn) + layout/ (coquille)    │
│  src/core/           fondation technique                  │
│    api/ auth/ permissions/ query/ config/                 │
│  src/integrations/   adaptateurs TanStack (query)         │
└─────────────────────────────────────────────────────────┘
                    │  HTTP + JWT (fetch wrapper)
                    ▼
        Backend NestJS → PostgreSQL
        https://dev.sim.strife-cyber.org/api/v1
```

## Couches et règles

| Couche | Contenu | Règle |
| --- | --- | --- |
| `core/` | Fondation technique générique (auth, api, permissions, query, env) | Aucune logique métier, aucun couplage aux modules. Importé par toutes les autres couches. |
| `features/` | Un dossier par module métier réel (M0–M11) | Vide tant que la fondation ne l'exige pas. La logique métier vit ici, jamais dans les routes. |
| `routes/` | Fichiers de route TanStack Router | Colle d'orchestration uniquement : guards, layouts, mise en page. |
| `components/ui` | shadcn/ui générés | Ne pas les modifier pour du métier ; composer à la place. |
| `components/layout` | Coquille applicative (header, logout, notifications) | Générique, partagée par les écrans authentifiés. |
| `integrations/` | Adaptateurs entre le framework et les libs (tanstack-query) | Survit à la migration d'une lib sans toucher au reste. |

## Fichiers générés (jamais édités à la main)

| Fichier | Généré par | Régénération |
| --- | --- | --- |
| `src/routeTree.gen.ts` | `npm run generate-routes` | Après chaque ajout/suppression de fichier dans `src/routes/`. |
| `src/core/api/generated/schema.ts` | `npm run api:gen` | À chaque évolution du backend (`docs-json`). |

Ces fichiers sont exclus de Biome et sont commités. Voir
`docs/development.md` pour les commandes exactes.

## Anti-dépendances

- `core/api` ne connaît pas `core/auth` : le client HTTP reçoit ses dépendances
  (`getAccessToken`, `refresh`, `onSessionExpired`) par injection lors de la
  construction de la session (`core/auth/session.ts` → `setApiClient`).
- Les guards de route lisent la session depuis le **contexte router** (`auth`),
  jamais depuis un module global.

## À ne pas faire

- ❌ Ajouter un `fetch()` brut dans un composant ou une route (tout passe par `core/api`).
- ❌ Éditer à la main `schema.ts` ou `routeTree.gen.ts`.
- ❌ Importer une feature depuis une autre feature sans passer par son `index` public.
