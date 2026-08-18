# `src/features/` — Conventions des fonctionnalités métier

Ce dossier est **volontairement vide** : la fondation (auth, permissions,
API, query, routing, layout) ne doit contenir **aucune fonctionnalité
métier** (spec `prompt-adapted.md` §« IMPORTANT »). Il documente ici la
convention à suivre dès qu'un module métier sera développé.

## Modules réels (M0–M11)

Chaque module métier du backend aura, le moment venu, son dossier feature.
Note : le module **Market (M1) n'a aucun préfixe de permission** dans le
backend déployé (vérifié sur `GET /auth/me`) — un préfixe de permission n'est
pas synonyme de module métier.

| Module | Préfixe de permission |
| --- | --- |
| Résidence (M0) | `RESIDENCE` |
| Market (M1) | — *(aucun)* |
| Pressing (M2) | `PRESSING` |
| Restaurant (M3) | `RESTAURANT` |
| Salle de fête (M4) | `SALLE_FETE` |
| Facturation (M5) | `FACTURATION` |
| Finances (M6) | `FINANCES` |
| RH (M7) | `RH` |
| Clients (M8) | `CLIENT` |
| Marchandises (M9) | `MARCHANDISE` |
| Administration (M10) | `ADMIN` |
| Rapports (M11) | `AUDIT` |

Les codes de permission réels sont définis dans `src/core/permissions`
(`RESIDENCE.VOIR`, `CLIENT.SUPPRIMER`, …). **On n'invente jamais** de préfixe
ou de verbe : seuls `VOIR` / `CREER` / `MODIFIER` / `SUPPRIMER` existent
(union revalidée au smoke test — le spec §9 décrit un modèle plus ancien).

## Structure d'un dossier feature

```
src/features/<module>/        ex. src/features/residence/
  api/          appels endpoint du module (via le client API généré)
  components/   composants d'écran propres au module
  hooks/        hooks métier (requêtes TanStack Query, mutations)
  models/       types métier dérivés (jamais une duplication du schéma généré)
  permissions.ts  clés de requêtes + gates de permission locaux
```

## Règles

1. **Pas de fonctionnalité métier hors de `features/`.** Les routes (`src/routes/`)
   restent de la colle : elles orchestrent des composants de features, sans
   logique métier ni fetch brut.
2. **Pas de logique métier dans `src/core/`.** `core/` est la fondation
   technique (auth, api, permissions, query, config) : générique,
   indépendante des modules.
3. **Les types de requête viennent du client généré** (`core/api/generated`).
   Les types métier supplémentaires se dérivent, on ne duplique pas les DTO.
4. **Les clés de requêtes** se déclarent avec `createQueryKeys(scope)` de
   `core/query` (ex. `createQueryKeys('residence.contrats')`).
5. **L'UI ne lit jamais `useAuth()` directement** dans un composant métier :
   on passe par `useCurrentUser()` / `useCan(...)` (`core/auth`).

Voir aussi : [`docs/architecture.md`](../../docs/architecture.md) et
[`docs/conventions.md`](../../docs/conventions.md).
