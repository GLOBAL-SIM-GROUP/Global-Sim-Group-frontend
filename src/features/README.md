# `src/features/` — Conventions des fonctionnalités métier

> Mis à jour 2026-09-27. Ce dossier a longtemps été documenté comme
> « volontairement vide » (état jour 1 de la fondation) — ce n'est plus le
> cas depuis longtemps : il contient aujourd'hui 19 modules, plusieurs
> centaines de fichiers. La convention ci-dessous reste la même, elle
> documente maintenant une pratique établie, pas une intention future.

## Modules réels

Chaque dossier correspond à un module métier (ou à une surface transverse) du
backend réel. Le préfixe de permission n'est pas toujours le même que le nom
du dossier (`portail`/`espace-client` partagent par exemple `PORTAIL.VOIR` et
des verbes propres au compte CLIENT ; `landing`, `auth`, `admin` n'ont pas de
préfixe métier dédié).

| Dossier | Préfixe(s) de permission principaux |
| --- | --- |
| `residence` | `RESIDENCE` (+ `RESIDENT.VOIR` pour le portail résident) |
| `pressing` | `PRESSING` |
| `restaurant` | `RESTAURANT` |
| `salle-fete` | `SALLE_FETE` |
| `facturation` | `FACTURATION` |
| `finances` | `FINANCES`, `DEPENSE` |
| `rh` | `RH` |
| `clients` | `CLIENT` |
| `marchandise` | `MARCHANDISE` |
| `abonnement` | `ABONNEMENT` |
| `admin` | `ADMIN`, `AUDIT` |
| `rapports` | `RAPPORTS` (module réel, distinct d'`ADMIN` — voir `core/permissions/types.ts`) |
| `signalements` | `SIGNALEMENT` |
| `portail` | `PORTAIL.VOIR` + `RESIDENT.VOIR` (portail résidence) |
| `espace-client` | `PORTAIL.VOIR` + verbes CLIENT (`COMMANDER`/`DECLARER`/`DEMANDER`) |
| `dashboard` | `RAPPORTS.VOIR` (tableau de bord global) |
| `landing`, `auth` | public, pas de permission |

Les codes de permission réels sont définis dans `src/core/permissions/types.ts`
— **union écrite à la main, revalidée en direct contre le backend** (le plus
sûr : `GET /admin/permissions`, catalogue complet ; `GET /auth/me`, permissions
du compte connecté). **On n'invente jamais** un préfixe ou un verbe : le
catalogue backend a crû plusieurs fois sans que ce dépôt le remarque tout de
suite (ex. le module `RAPPORTS`, resté modélisé comme « suit `ADMIN.VOIR` »
pendant des semaines après son introduction côté backend — corrigé le
2026-09-27) — vérifier en direct avant de supposer qu'un module/verbe
n'existe pas.

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
3. **Les types de requête viennent du client généré** (`core/api/generated`)
   **quand ils y sont** — beaucoup de réponses (permissions, plusieurs modules
   récents comme `abonnement`, `signalements`, le mode kilo de `pressing`)
   n'ont pas de schéma OpenAPI documenté côté backend et restent typées à la
   main, avec la source (endpoint testé en direct) citée en commentaire. Ne
   jamais dupliquer un DTO qui, lui, existe déjà dans le schéma généré.
4. **Les clés de requêtes** se déclarent avec `createQueryKeys(scope)` de
   `core/query` (ex. `createQueryKeys('residence.contrats')`).
5. **L'UI ne lit jamais `useAuth()` directement** dans un composant métier :
   on passe par `useCurrentUser()` / `useCan(...)` (`core/auth`).

Voir aussi : [`docs/architecture.md`](../../docs/architecture.md) et
[`docs/conventions.md`](../../docs/conventions.md).
