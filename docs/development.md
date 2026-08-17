# Développement

Gestionnaire de paquets : **npm** (`.npmrc` avec `legacy-peer-deps=true` pour
le conflit de peer de `openapi-typescript` vs TypeScript 6 — à conserver).

## Commandes

```bash
npm install            # installation (reproductible grâce à package-lock.json)
npm run dev            # serveur de dev sur http://localhost:3000
npm run typecheck      # tsc --noEmit (compile d'abord i18n via pretypecheck)
npm run check          # biome check + typecheck (à passer avant de finir une tâche)
npm run format         # biome format
npm run lint           # biome lint
npm run build          # build client + SSR de production (le plugin i18n compile au vol)
npm run preview        # sert le build de production
npm test               # vitest run
```

## Génération de code

```bash
npm run api:gen        # télécharge /docs-json → scripts/openapi.latest.json (gitignoré)
                       # → openapi-typescript → src/core/api/generated/schema.ts (commité)
npm run generate-routes # tsr generate → src/routeTree.gen.ts (après chaque changement de routes)
npm run i18n:compile   # paraglide-js compile → src/paraglide/** (gitignoré)
```

Le plugin `paraglideVitePlugin` dans `vite.config.ts` recompile les messages
au vol pendant `dev` et `build`. `pretypecheck` garantit que `src/paraglide/`
existe avant tout `tsc` (le dossier est gitignoré, un clone frais doit donc
passer par `npm run check` pour le générer).

## Environnement

Copier `.env.example` vers `.env` si nécessaire :

```
VITE_API_URL=/api/v1
```

La valeur par défaut `/api/v1` est **relative** (même origine) : en dev, le
proxy du `vite.config.ts` relaie `/api/*` vers le backend
`https://dev.sim.strife-cyber.org` (le CORS de ce backend refuse `localhost:*`).
Une URL absolue (`https://host/api/v1`) reste possible si le frontend est
hébergé sur un autre domaine.

`VITE_API_URL` est **non secret** (exposé au navigateur). Les tokens JWT ne
sont **jamais** mis dans un `.env` ni dans le bundle comme constantes.

## Production (Docker)

```bash
docker compose up --build     # build + run → http://localhost:3004
```

Le port hôte du compose est `3004` (3000 est capturé par WSL sur cette machine) ;
le port interne du container reste 3000 (`PORT`).

L'image (`Dockerfile` multi-stage) construit `dist/` puis l'exécute via
`server.mjs` : hôte `node:http` qui fait le rendu SSR (`dist/server/server.js`),
sert les assets (`dist/client/`), et **relaie `/api/*` vers le backend** défini
par la variable d'env `API_TARGET` (même pattern que le proxy Vite en dev —
le navigateur n'appelle que la même origine, le CORS du backend ne s'applique
pas). Sans `API_TARGET`, `/api/*` répond 404.

- `VITE_API_URL` est inliné au build (défaut `/api/v1`, même origine).
- `PORT` (défaut `3000`) et `API_TARGET` sont des variables du container.
- `docker compose` configure `API_TARGET` sur l'instance de **dev** par défaut
  — la remplacer par l'URL du backend de production au déploiement.
- `npm run build && node server.mjs` reproduit le runtime en local (sans Docker).

## Workflow type

1. `npm run dev` pour développer (HMR : routes, i18n, tailwind).
2. Après toute modification de `messages/*.json`, le plugin recompile ; pour
   vérifier au clavier : `npm run i18n:compile`.
3. Avant de terminer : `npm run check` puis `npm test`.

## À ne pas faire

- ❌ Utiliser `pnpm` ou `yarn` (le lockfile npm doit rester la source de vérité).
- ❌ Commiter `scripts/openapi.latest.json` ou `src/paraglide/**` (gitignorés).
- ❌ Retirer `legacy-peer-deps` du `.npmrc`.
