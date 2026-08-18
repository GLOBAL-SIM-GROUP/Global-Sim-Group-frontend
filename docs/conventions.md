# Conventions de code

## Langue

- Interface : **français uniquement**, libellés écrits en dur dans les
  composants (pas de couche de traduction FR/EN — Paraglide a été retiré).
- Code, commentaires et identifiants : l'anglais (camelCase) comme dans tout
  le code TypeScript ; les libellés utilisateur restent en français.

## Style

- Formateur/linter : **Biome** (`npm run check`, `npm run format`). Respecter
  ses règles avant de finir une tâche.
- Imports : alias canoniques `#/*` (→ `src/`) et `@/*` (compat). Les imports
  relatifs restent acceptables entre fichiers proches d'une même couche.
- TypeScript strict : `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`
  (utiliser `import type` pour les imports de types).

## Frontières

- **`core/`** : fondation générique, sans connaissance des modules métier.
- **`features/`** : logique métier uniquement ici (voir `src/features/README.md`).
- **`routes/`** : colle — pas de logique métier, pas de `fetch` brut, pas de
  requêtes TanStack Query directement (on appelle les hooks de features/core).
- **`components/ui`** : composants shadcn générés, ne pas les dupliquer ;
  composer les écrans avec `components/layout` + `components/ui`.
- **Type générés** : ne jamais dupliquer un DTO du client OpenAPI généré ;
  ajouter des types dérivés dans `features/<module>/models`.

## Patterns imposés

- **Pas de `useUtils()`** : importer chaque hook/utilitaire nommément
  (`useCurrentUser()`, `useCan(code)`, `createQueryKeys(...)`).
- **Pas de `useState` pour l'état serveur** : tout état serveur passe par
  TanStack Query (`core/query`).
- **Pas de nouvelle dépendance** sans justification : la poser dans la PR et
  documenter pourquoi.

## À ne pas faire

- ❌ Créer `src/hooks/` ou `src/lib/` génériques fourre-tout (l'organisation se
  fait par couche `core/` / `features/`).
- ❌ Éditer les fichiers générés (`schema.ts`, `routeTree.gen.ts`).
- ❌ Inventer des endpoints, permissions ou modules (voir `docs/authorization.md`).
