# PROMPT CLAUDE CODE — PAGE « MENU GLOBAL » / LANCEUR DE MODULES (GLOBAL SIM GROUP)

> Ce prompt décrit une **transformation de la page d'accueil existante**, pas
> une création. La page d'accueil protégée existe déjà et fonctionne
> (`src/routes/_authenticated/index.tsx`) : bienvenue + permissions + état du
> service. La tâche : la transformer en **lanceur de modules** (grille de tuiles
> pilotée par les permissions) et ajouter une **sidebar** au layout existant,
> sans casser l'auth ni la fondation.

---

## ⚠ IMPORTANT — l'image de la maquette n'est PAS visible

Claude Code reçoit l'image jointe (`image.png`) comme `[Unsupported Image]` :
**elle n'est pas lisible par l'exécuteur**. La spec de rendu est portée par la
**description écrite ci-dessous** (§ Rendu attendu). Si l'image est réellement
jointe, l'exécuteur l'ignorera : se conformer au texte.

## ⚠ Décisions à trancher AVANT toute implémentation

1. **La page d'accueil existe déjà.** La route protégée est
   `src/routes/_authenticated/index.tsx` (URL `/`), gardée par le layout
   `_authenticated.tsx` (`beforeLoad` → redirection `/login` si non
   authentifié). **Ne PAS créer `src/routes/index.tsx`** : ce serait une
   seconde home, non protégée. → **Transformation** de
   `_authenticated/index.tsx`, pas de création.
2. **Le layout global existe déjà.** `src/components/layout/app-shell.tsx`
   (`AppShell`, header : marque + sélecteur de langue + user/rôle + logout) est
   monté par `_authenticated.tsx` (avec `AuthProvider` + `Outlet`).
   **Ne PAS créer `AppLayout.tsx`** — **étendre `AppShell`** en lui ajoutant la
   sidebar (nav gauche). Un éventuel `sidebar.tsx` est un composant *au sein
   de* `AppShell`, pas un layout parallèle.
3. **Aucune route de module n'existe (volontairement).** La fondation
   n'implémente aucune fonctionnalité métier (spec §« IMPORTANT »). Le routeur
   TanStack est **typé** : `to="/residence"` ne typecheckerait pas tant que la
   route n'existe pas. → Deux options, à choisir :
   - **Option A (recommandée, fidèle à la maquette)** : les tuiles/liens de la
     sidebar pointent vers **une seule route placeholder partagée** (ex.
     `/en-cours`, un seul fichier sous `_authenticated/`), qui affiche « Module
     en cours de développement ». Supprimée quand les modules réels arriveront.
     **Jamais une route par module.**
   - **Option B (stricte)** : tuiles et liens de modules **non cliquables**
     (état visuel « à venir ») jusqu'à l'arrivée des routes modules. Seul le
     lien Global (`/`) est actif.
4. **Permissions réelles — le prompt d'origine contient des erreurs.**
   Le backend renvoie **12 modules × 4 verbes** (`MODULES` dans
   `src/core/permissions/types.ts`) : RESIDENCE, PRESSING, RESTAURANT,
   SALLE_FETE, FACTURATION, FINANCES, RH, CLIENT, MARCHANDISE, ADMIN, AUDIT,
   CORE — verbes **VOIR / CREER / MODIFIER / SUPPRIMER**. **Il n'y a pas de
   `READ`** (le droit de lecture est `MODULE.VOIR`), **pas de module `MARKET`**.
   Les tuiles s'affichent si l'utilisateur a `MODULE.VOIR`. La liste des
   modules du prompt d'origine (« Résidence, Marché, Pressing, Restaurant,
   Finances, RH, Rapports, Administration ») est **fausse** : voir décision 5.
5. **« Marché » et « Rapports » n'existent pas** comme modules de permission.
   - `MARCHANDISE` (marchandise/stocks) **≠** « Marché » (market) : ne pas la
     baptiser « Marché » sans validation produit. Étiquette par défaut :
     « Marchandise ».
   - Aucun module ni permission `RAPPORTS` : pas de tuile « Rapports ». (Les
     rapports relèveront de modules existants ou d'un futur module — hors
     scope, pas d'invention.)
   - « Blanchisserie » = `PRESSING` (étiquette libre : « Blanchisserie » ou
     « Pressing » — la maquette dit Blanchisserie).
   - « Tableau de bord » : aucune route ni permission réelle → **pas de lien
     dashboard** (cohérent avec « ne pas créer `/dashboard` » du prompt
     d'origine). Le « Global » de la sidebar = la home `/` (`nav_home`).
   - Modules réels absents du prompt d'origine à ajouter : **RESTAURANT,
     SALLE_FETE, FACTURATION, CLIENT, MARCHANDISE, AUDIT, CORE**.
6. **Pas de prénom.** L'utilisateur réel (`AuthMeResponse`,
   `src/core/api/types.ts`) est `{ id, login, role, permissions }` — **aucun
   `firstName`**. « Bienvenue, [Prénom] ! » devient « Bienvenue, **{login}** ! »
   (ex. `admin`). Le rôle existe (`role`) et s'affiche (sidebar footer).
7. **i18n : clés plates snake_case, pas de clés dotées.** Le projet utilise
   Paraglide avec des clés plates (`auth_login_title`, `home_welcome`…) dans
   `messages/fr.json` / `messages/en.json`, appelées `m.*()` en camelCase.
   Pas de `app.welcome`, `app.nav.global`, `app.modules.residence.title`.
   Convention pour les modules : `module_<code>_title` / `module_<code>_description`
   (ex. `module_residence_title`).

---

## Contexte (état réel du projet, vérifié)

- **Stack** : React 19 · TanStack Router (file-based, guard `beforeLoad`,
  routes **typées**) · TanStack Form · TanStack Query · Paraglide i18n FR/EN ·
  shadcn/ui + Tailwind v4 · lucide-react · Biome · Vitest.
- **Déjà en place à réutiliser** :
  - Layout protégé : `_authenticated.tsx` → `AppShell` (`app-shell.tsx`).
  - Hooks : `useCurrentUser()`, `usePermissions()`, `useCan(code)`
    (`src/core/auth/hooks.ts`) ; `hasPermission` / `hasAnyPermission` /
    `hasAllPermissions` (`src/core/permissions/index.ts`) ;
    `useHealthQuery()` (`src/core/query/hooks.ts`).
  - `MODULES` (12 codes) + `PermissionVerb` + `PermissionCode`
    (`src/core/permissions/types.ts`).
  - Home actuelle : `_authenticated/index.tsx` (bienvenue + login/rôle +
    liste permissions + carte santé) — c'est elle qu'on **transforme**.
- **Conventions** : pas de dossier `src/config/` (ni `/types`, `/utils` top
  level) — la logique va dans `src/core/`. Le registre des modules a sa place
  naturelle dans `src/core/permissions/`, à côté de `MODULES`. Les composants
  réutilisables shadcn vont dans `src/components/ui/`, les composants de
  layout dans `src/components/layout/`. Permissions = UX uniquement (le
  backend reste la frontière de sécurité). Tokens teal/vert (`--sea-ink`,
  `--lagoon`, `--palm`…) — pas de bleu/orange.

## Mission

Transformer la home protégée en **lanceur de modules** : grille de tuiles
**pilotée par les permissions réelles** (`MODULE.VOIR`), chaque tuile = module
(icône + titre + description), et ajouter une **sidebar** au `AppShell`.
Aucune fonctionnalité métier, aucune route de module, aucune permission
inventée, aucun changement de l'auth.

## Rendu attendu (spec écrite de la maquette)

- **Sidebar** (gauche, fixe sur desktop) : logo texte `m.app_name()` en haut,
  nav (Global = `/` actif ; puis les modules accessibles), **footer avec
  user + rôle**. Répond à la décision 3 pour la cliquabilité des modules.
- **Zone de contenu** : message de bienvenue « Bienvenue, **{login}** ! »
  (message i18n avec paramètre), sous-titre « Sélectionnez un module pour
  commencer. », puis **grille de tuiles** responsive
  (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), triées par code module.
  Chaque tuile : icône lucide, titre, description courte, lien (décision 3).
  Aucun module affiché si l'utilisateur n'a pas `MODULE.VOIR` ; s'il n'a aucun
  module, message vide i18n.
- **Header existant** : conserver marque + sélecteur de langue + logout. Le
  user/rôle affiché à la fois dans le header ET le footer sidebar est
  redondant → **recommandé** : user/rôle dans le footer de la sidebar (per
  maquette), header réduit à marque + langue + logout.

## 1. Registre des modules — `src/core/permissions/modules.ts`

Nouveau fichier, à côté de `MODULES` (dont il est dérivé) :

- Type `ModuleDefinition` : `{ code: ModuleCode, title: string /* clé i18n */,
  description: string /* clé i18n */, icon: LucideIcon, path: string /* route
  future, documentée comme telle */, permission: PermissionCode }` avec
  `permission = \`${code}.VOIR\``.
- `MODULE_DEFINITIONS: ModuleDefinition[]` — **les 12 modules réels**, chacun
  avec icône lucide (ex. : RESIDENCE→Building2, PRESSING→Shirt,
  RESTAURANT→UtensilsCrossed, SALLE_FETE→PartyPopper, FACTURATION→Receipt,
  FINANCES→Wallet, RH→Users, CLIENT→Users2, MARCHANDISE→Package, ADMIN→ShieldCheck,
  AUDIT→ClipboardList, CORE→Settings — à ajuster), et les clés i18n
  `module_<code>_title` / `module_<code>_description`.
- **Fonction pure** `getAccessibleModules(permissions: readonly string[]) :
  ModuleDefinition[]` — filtre sur `hasPermission(permissions, def.permission)`,
  triée. **Rien d'autre** dans ce fichier (pas de logique React).

## 2. Sidebar — `src/components/layout/sidebar.tsx`

- Composant de layout (pas de route), reçoit la liste des modules (ou appelle
  `usePermissions()` + `getAccessibleModules`).
- Logo texte `m.app_name()`, lien Global (`/`) avec état actif, puis les
  modules accessibles. Footer : `{login} · {role}` (i18n pour les libellés).
- Lien actif : `Link` TanStack avec `activeProps` (ou `useLocation`) — seul `/`
  est une vraie route active aujourd'hui (décision 3).
- A11y : nav sémantique (`<nav aria-label>`), lien actif
  `aria-current="page"`, contrastes.

## 3. AppShell étendu — `src/components/layout/app-shell.tsx`

- **Étendre** : ajouter la sidebar à gauche (desktop : `hidden lg:flex`),
  contenu `{children}` à droite, header conservé (marque + langue + logout).
- Le composant reste le layout unique monté par `_authenticated.tsx`. Pas de
  nouveau fichier de layout.

## 4. Tuile — `src/components/ui/module-tile.tsx`

- Style shadcn (`Card` ou carte custom avec tokens `bg-card`, `border`,
  `text-muted-foreground`), icône + titre + description.
- Lien selon décision 3 (route placeholder partagée si Option A, non-cliquable
  avec état « à venir » si Option B). A11y : lien/label descriptif.

## 5. Transformation de la home — `src/routes/_authenticated/index.tsx`

- Remplacer le contenu minimal (liste permissions, carte santé) par : bienvenue
  avec login, sous-titre, grille de tuiles via `getAccessibleModules(usePermissions())`.
- La liste brute des permissions et la carte santé étaient des preuves de
  câblage de la fondation : **supprimées** au profit du lanceur (le user/rôle
  reste visible en sidebar). Si un besoin dev demeure, le garder hors de
  l'UI visible.

## 6. i18n — `messages/fr.json` / `messages/en.json`

Ajouter les clés plates (fr + en), puis régénérer `src/paraglide/`
(`npm run i18n:compile` ou plugin au build) :

- `home_welcome_name` : « Bienvenue, {name} ! » / « Welcome, {name}! »
- `home_subtitle_select_module` : « Sélectionnez un module pour commencer. » /
  « Select a module to get started. »
- `home_no_modules` : « Aucun module accessible. » / « No modules available. »
- `home_module_pending` (Option B) : « Module en cours de développement » /
  « Module under development ».
- `module_<code>_title` et `module_<code>_description` pour **les 12 modules**
  (ex. `module_residence_title` « Résidence » / « Residence »,
  `module_residence_description` « Gestion des locataires, baux et
  maintenance. » / « Tenants, leases and maintenance management. », etc.).
- Libellés sidebar réutilisant ces clés (pas de doublons).

## 7. Routing

- Si Option A : une seule route `src/routes/_authenticated/en-cours.tsx`
  (message i18n `home_module_pending`), puis **`npm run generate-routes`**
  (routeTree.gen.ts est généré, jamais édité).
- Option B : aucun nouveau fichier de route.

## 8. Tests

- **Ajouter `src/core/permissions/modules.test.ts`** : `getAccessibleModules`
  (filtre VOIR, tri, module sans permission exclu). Logique pure, pas de DOM.
- Pas de test d'UI obligatoire pour la grille (les hooks existants sont déjà
  couverts). Aucun `index.test.tsx` n'existe — ne pas en inventer un si
  inutile.

## À ne pas faire

- ❌ Créer `src/routes/index.tsx` (2e home non protégée) ni `AppLayout.tsx`.
- ❌ Créer des routes de modules (`/residence`, `/dashboard`…) ou des pages
  métier — les routes modules viendront avec le travail de fondation.
- ❌ Inventer des permissions (`READ`, `MARKET`, `RAPPORTS`) ou des modules
  hors des 12 réels ; utiliser `MODULES` comme source unique.
- ❌ Utiliser `localStorage` pour le token, toucher à `core/auth`/`core/api`,
  ni dupliquer les types générés.
- ❌ Hardcoder les noms/labels des modules dans le JSX — tout passe par le
  registre + i18n.
- ❌ Dossier `src/config/`, top-level `/types`, `/utils` ; CSS-in-JS ; charte
  bleu/orange ; strings en dur.
- ❌ Garder les sections dev de la home (liste permissions, carte santé) dans
  l'UI visible finale sans nécessité.

## Qualité (obligatoire avant de conclure)

- `npm run check` (Biome + `tsc --noEmit`) vert.
- `npm test` vert (depuis le dossier frontend).
- `npm run generate-routes` si Option A (route placeholder ajoutée).
- Servir la page (dev ou build + `node server.mjs`) et laisser l'utilisateur
  **vérifier visuellement** le rendu (la maquette image n'est pas lisible par
  l'exécuteur). Vérifier FR/EN, l'état sans permission (compte à permissions
  réduites si possible), et la sidebar active sur `/`.

## Livrable

1. `src/core/permissions/modules.ts` — registre (12 modules, icônes, clés i18n)
   + `getAccessibleModules`.
2. `src/components/layout/sidebar.tsx` — menu latéral (nav + footer user/rôle).
3. `src/components/layout/app-shell.tsx` — étendu (sidebar + header conservé).
4. `src/components/ui/module-tile.tsx` — tuile de module.
5. `src/routes/_authenticated/index.tsx` — transformé en lanceur.
6. `src/routes/_authenticated/en-cours.tsx` — **si Option A** (placeholder).
7. `messages/fr.json` + `messages/en.json` mis à jour, `src/paraglide/`
   régénéré.
8. `src/core/permissions/modules.test.ts` — test de `getAccessibleModules`.
9. `npm run check` + `npm test` verts.
