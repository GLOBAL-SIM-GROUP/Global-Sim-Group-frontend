# PROMPT CLAUDE CODE — SIDEBAR AVEC ACCORDÉON (version corrigée)

## Ce qui a été corrigé par rapport au prompt original

1. **Couleurs (exigence utilisateur)** — les tokens `--sea-ink`/`--lagoon`/`--palm`
   existent mais **changent de valeur sous `.dark`** (`--sea-ink` y devient
   `#d7ece8`, presque blanc) : une sidebar en `var(--sea-ink)` s'éclaircirait en
   mode sombre. La palette de la sidebar doit être **figée** → on ajoute 3 tokens
   `--color-*` fixes dans `@theme inline` (`bg-sea-ink`, `bg-lagoon`, `border-palm`)
   qui sont **valides et stables dans les deux thèmes**.
2. **Fichier** : la sidebar existante est `src/components/layout/sidebar.tsx`
   (kebab-case) — on la **réécrit**, on n'en crée pas de nouvelle.
3. **Config** : pas de `src/config/modules.ts` — on **étend le registre existant**
   `src/core/permissions/modules.ts` (source unique, déjà utilisé par le lanceur).
4. **Modules réels** : 12 modules (`RESIDENCE PRESSING RESTAURANT SALLE_FETE
   FACTURATION FINANCES RH CLIENT MARCHANDISE ADMIN AUDIT CORE`). Il n'y a **ni
   « Marché » ni « Rapports »** — Marchandise et Audit les remplacent. Les
   en-têtes d'accordéon réutilisent les libellés existants `module_*_title`.
5. **Permissions** : verbes réels `VOIR/CREER/MODIFIER/SUPPRIMER` — **pas de
   `READ`**. Tout sous-menu est gâté par `<CODE>.VOIR`.
6. **Aucune route métier n'existe** (fondation uniquement) : les sous-pages
   (Bâtiments, Logements…) sont déclarées dans le registre comme *navigation
   future*, mais **toutes pointent vers le placeholder partagé**
   `/en-cours?module=…&page=…`. On ne crée aucune route, aucune page factice.
7. **Hooks réels** : `useCurrentUser()`, `usePermissions()`,
   `getAccessibleModules(...)`. Pas de `useSession()`. `AuthMeResponse =
   {id, login, role, permissions}` — **pas de `firstName`/`lastName`/`role.label`**.
8. **Paraglide** : clés flat snake_case (`nav_residence_batiments`), accès par
   **fonction** (`module.title()`), jamais `m[module.labelKey]()` (invalide en
   Paraglide 2).
9. **Pas de nouvelle dépendance** : aucun composant Accordion/Collapsible shadcn
   n'est installé → accordéon en `<button>` + `useState`, un seul module ouvert
   à la fois (recommandation du prompt).
10. **Active state** : idiomatique TanStack Router (`activeProps`/`activeOptions`),
    plus d'auto-ouverture du module parent selon le paramètre `module` de l'URL.

---

## Contexte (état réel du projet)

- Stack : React 19 · TanStack Router (SSR, TanStack Start) · shadcn/ui · Tailwind v4 · Paraglide i18n.
- Sidebar actuelle : `src/components/layout/sidebar.tsx` — brand `m.app_name()`,
  lien « Accueil » (`/`), puis la liste des 12 modules via
  `getAccessibleModules()`, footer `user.login` + `user.role`. **Pas encore de
  fond sombre, pas d'accordéon.**
- Registre : `src/core/permissions/modules.ts` — `ModuleDefinition {code, title,
  description, icon, path, permission}` (12 entrées, `permission` = `<CODE>.VOIR`).
- Route placeholder : `src/routes/_authenticated/en-cours.tsx` —
  `validateSearch: {module?: string}`, affiche « <Module> — Module en cours de
  développement ».
- Tokens existants : `--sea-ink #173a40`, `--lagoon #4fb8b2`, `--palm #2f6a4a`
  — **variables adaptatives (redéfinies sous `.dark`), donc NON utilisables pour
  un fond fixe**. Seuls les tokens `--color-*` de `@theme inline` produisent des
  utilitaires Tailwind.
- Hooks auth : `useCurrentUser()`, `usePermissions()` depuis `#/core/auth`.
- Règle du projet : **aucune fonctionnalité métier n'est implémentée**, aucun
  libellé en dur, aucune endpoint ni permission inventée.

---

## 🎨 Couleurs de la sidebar — FIXES, indépendantes du thème (exigence)

### 1. Ajouter 3 tokens figés dans `src/styles.css` (`@theme inline`)

```css
@theme inline {
  /* … tokens shadcn existants … */

  /* Palette fixe de la sidebar (maquette). Valeurs FIGÉES : --sea-ink/--lagoon/
     --palm changent de valeur sous `.dark` et éclairciraient la sidebar.
     Utiliser bg-sea-ink, bg-lagoon, border-palm, text-lagoon. */
  --color-sea-ink: #173a40;
  --color-lagoon: #4fb8b2;
  --color-palm: #2f6a4a;
}
```

### 2. Table des classes (équivalent exact de la maquette)

| Élément                      | Classe Tailwind                        |
| ---------------------------- | -------------------------------------- |
| Fond de la sidebar           | `bg-sea-ink`                           |
| Texte des liens              | `text-gray-300 hover:text-white`       |
| Surbrillance actif           | `bg-lagoon text-white font-medium`     |
| Survol en-tête / sous-menu   | `hover:bg-lagoon/20`                   |
| Bordure (séparations)        | `border-palm`                          |
| Icônes                       | `text-lagoon`                          |
| Nom utilisateur              | `text-white font-medium`               |
| Rôle utilisateur             | `text-gray-400 text-sm`                |
| Bouton déconnexion           | `text-gray-300 hover:bg-lagoon/20 hover:text-white` |

> ⚠️ Le CSS global `a { color: var(--lagoon-deep) }` colore tous les liens : les
> liens de la sidebar définissent des couleurs explicites (utilitaires) pour le
> surcharger.

---

## 🧩 Structure attendue

La sidebar reste un `<aside>` **sticky** dans l'app-shell existant
(`sticky top-14 h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto`,
masqué sous `lg`), désormais à fond `bg-sea-ink`. Trois zones, de haut en bas :

1. **Section « Global »** (toujours visible) : marque `m.app_name()` + lien
   « Accueil » vers `/` (icône `LayoutGrid`, actif `bg-lagoon`).
2. **Sections modulaires (accordéons)** : un en-tête cliquable par module
   accessible (icône + `module.title()` + chevron si sous-menus). **Un seul
   module ouvert à la fois** ; au clic, ouvre/ferme. Le module parent s'ouvre
   automatiquement si un sous-menu actif correspond au `module` de l'URL.
3. **Zone utilisateur (bas)** : `user.login` + `user.role`, puis le bouton
   Déconnexion (réutilise `LogoutButton`, restylé).

---

## 📂 Données : extension du registre `src/core/permissions/modules.ts`

Ajouter `SubMenuItem` et `subItems?: SubMenuItem[]` sur `ModuleDefinition` :

```ts
/** Sous-page d'un module. La route métier (`path`) n'existe pas encore : le
 *  rendu actuel pointe vers /en-cours?module=…&page=… (placeholder partagé).
 *  Déclarée ici pour câbler la navigation quand la route sera construite. */
export interface SubMenuItem {
  /** Identifiant stable, ex. "logements" — sert de paramètre `page` dans /en-cours. */
  id: string;
  /** Libellé localisé (message Paraglide, jamais de string en dur). */
  label: () => string;
  /** Permission requise pour afficher : `<CODE>.VOIR`. */
  permission: PermissionCode;
  /** Route future de la page (non construite, documentée pour le câblage). */
  path: string;
}

export interface ModuleDefinition {
  /* … code, title, description, icon, path, permission inchangés … */
  /** Sous-pages du module. Vide tant que la route métier n'existe pas. */
  subItems?: SubMenuItem[];
}
```

Filtre pur des sous-menus (même contrat que `getAccessibleModules`) :

```ts
export function getAccessibleModuleSubItems(
  def: ModuleDefinition,
  permissions: readonly string[],
): SubMenuItem[] {
  return (def.subItems ?? []).filter((sub) =>
    hasPermission(permissions, sub.permission),
  );
}
```

**Exemple concret — Résidence** (seul module à déclarer des sous-pages
aujourd'hui ; les autres gardent `subItems` vide jusqu'à la construction de leur
route métier, validée contre `/docs-json`) :

```ts
{
  code: "RESIDENCE",
  title: m.module_residence_title,
  description: m.module_residence_description,
  icon: Building2,
  path: "/residence",
  permission: "RESIDENCE.VOIR",
  subItems: [
    { id: "batiments",     label: m.nav_residence_batiments,     permission: "RESIDENCE.VOIR", path: "/residence/batiments" },
    { id: "logements",     label: m.nav_residence_logements,     permission: "RESIDENCE.VOIR", path: "/residence/logements" },
    { id: "locations",     label: m.nav_residence_locations,     permission: "RESIDENCE.VOIR", path: "/residence/locations" },
    { id: "sejours_courts",label: m.nav_residence_sejours_courts,permission: "RESIDENCE.VOIR", path: "/residence/sejours-courts" },
    { id: "charges",       label: m.nav_residence_charges,       permission: "RESIDENCE.VOIR", path: "/residence/charges" },
    { id: "portail",       label: m.nav_residence_portail,       permission: "RESIDENCE.VOIR", path: "/residence/portail" },
  ],
},
```

---

## 🧩 Composants à créer / modifier

### 1. `src/styles.css` — les 3 tokens figés (cf. section Couleurs)

### 2. `src/core/permissions/modules.ts` — `SubMenuItem` + `subItems` + helper

### 3. `src/components/layout/sidebar.tsx` — réécriture en accordéon

```tsx
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, LayoutGrid } from "lucide-react";

import { useCurrentUser, usePermissions } from "#/core/auth";
import {
  getAccessibleModuleSubItems,
  getAccessibleModules,
} from "#/core/permissions/modules";
import { cn } from "#/lib/utils";
import * as m from "#/paraglide/messages";

import { LogoutButton } from "./logout-button";

export function Sidebar() {
  const user = useCurrentUser();
  const permissions = usePermissions();
  const accessibleModules = getAccessibleModules(permissions);
  const { search } = useLocation();
  const activeModule = (search as { module?: string } | undefined)?.module;

  const [openModule, setOpenModule] = useState<string | null>(activeModule ?? null);

  const toggleModule = (code: string) =>
    setOpenModule((current) => (current === code ? null : code));

  const linkClassName =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-lagoon/20 hover:text-white";
  const headerClassName = (isOpen: boolean) =>
    cn(linkClassName, "w-full text-left", isOpen && "bg-lagoon/20 text-white");

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 flex-col justify-between overflow-y-auto border-r border-palm bg-sea-ink px-3 py-4 lg:flex">
      <div className="space-y-6">
        <span className="px-3 text-lg font-semibold text-white">{m.app_name()}</span>

        <nav aria-label={m.nav_sidebar_label()}>
          <ul className="space-y-1">
            <li>
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-lagoon text-white" }}
                className={linkClassName}
              >
                <LayoutGrid className="size-4 text-lagoon" aria-hidden />
                {m.nav_home()}
              </Link>
            </li>

            {accessibleModules.map((module) => {
              const isOpen = openModule === module.code;
              const subItems = getAccessibleModuleSubItems(module, permissions);

              return (
                <li key={module.code}>
                  <button
                    type="button"
                    onClick={() => toggleModule(module.code)}
                    className={headerClassName(isOpen)}
                  >
                    <module.icon className="size-4 text-lagoon" aria-hidden />
                    <span className="flex-1 text-left">{module.title()}</span>
                    {subItems.length > 0 && (
                      <ChevronDown
                        className={cn(
                          "size-4 text-lagoon transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                        aria-hidden
                      />
                    )}
                  </button>

                  {subItems.length > 0 && isOpen && (
                    <ul className="ml-5 mt-1 space-y-1 border-l border-palm pl-2">
                      {subItems.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            to="/en-cours"
                            search={{ module: module.code, page: sub.id }}
                            activeOptions={{ includeSearch: true }}
                            activeProps={{ className: "bg-lagoon text-white font-medium" }}
                            className="block rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-lagoon/20 hover:text-white"
                          >
                            {sub.label()}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {user ? (
        <div className="space-y-3 border-t border-palm pt-3">
          <div className="px-3">
            <p className="truncate text-sm font-medium text-white">{user.login}</p>
            {user.role ? <p className="text-sm text-gray-400">{user.role}</p> : null}
          </div>
          <LogoutButton className="w-full justify-start text-gray-300 hover:bg-lagoon/20 hover:text-white" />
        </div>
      ) : null}
    </aside>
  );
}
```

### 4. `src/components/layout/logout-button.tsx` — prop `className`

Le `Button` shadcn fusionne déjà ses classes avec `cn` : ajouter un prop optionnel
`className?: string` passé au `Button`, pour restyler le bouton dans la sidebar
sombre (sinon le ghost par défaut utilise `hover:bg-accent`, clair).

### 5. `src/components/layout/app-shell.tsx` — déconnexion mobile seulement

La Déconnexion vit maintenant dans le footer de la sidebar (desktop). Dans le
header, la passer en `lg:hidden` (sinon doublon sur desktop) :
`<span className="lg:hidden"><LogoutButton /></span>` — le sélecteur de langue
reste visible partout.

### 6. `src/routes/_authenticated/en-cours.tsx` — paramètre `page`

```ts
validateSearch: z.object({
  module: z.string().optional(),
  page: z.string().optional(),
}),
```

Et afficher le libellé du sous-menu si `page` est fourni (lookup
`MODULE_DEFINITIONS.find(...)?.subItems?.find(...)`), sinon le titre du module.
Aucune nouvelle route.

### 7. `src/core/permissions/modules.test.ts` — tests du filtre sous-menus

`getAccessibleModuleSubItems` : filtre par `<CODE>.VOIR`, retourne `[]` si
`subItems` absent, conserve l'ordre.

---

## 🧩 Messages i18n à ajouter (`messages/fr.json` + `messages/en.json`)

Les en-têtes d'accordéon réutilisent les clés existantes `module_*_title`
(12 modules). Ajouter uniquement les sous-pages de Résidence :

| Clé                          | fr                            | en                               |
| ---------------------------- | ----------------------------- | -------------------------------- |
| `nav_residence_batiments`    | Bâtiments                     | Buildings                        |
| `nav_residence_logements`    | Logements                     | Units                            |
| `nav_residence_locations`    | Locations                     | Leases                           |
| `nav_residence_sejours_courts`| Séjours courts               | Short stays                      |
| `nav_residence_charges`      | Charges et abonnements        | Charges & subscriptions          |
| `nav_residence_portail`      | Portail résident              | Resident portal                  |

> Clés du prompt original **non ajoutées** : `app.nav.market` (pas de module
> Marché → MARCHANDISE existe), `app.nav.reports` (pas de module Rapports →
> AUDIT), `app.nav.dashboard` (pas de page Tableau de bord), `app.nav.*` pour
> produits/stock/ventes/… (aucune page construite — à déclarer au fil des
> modules), `app.user.greeting`/`app.user.role` (footer = `user.login` +
> `user.role` bruts), `app.auth.logout` (existe déjà : `auth_logout`).

---

## 📋 Checklist de validation

- [ ] Sidebar à fond **`bg-sea-ink` fixe** dans les deux thèmes (ne s'éclaircit pas en `.dark`)
- [ ] En-têtes de module cliquables, **un seul accordéon ouvert** à la fois
- [ ] Chevron qui pivote (`rotate-180`) quand le module est ouvert
- [ ] Sous-menus filtrés par `<CODE>.VOIR` (et modules par `getAccessibleModules`)
- [ ] Lien actif en **`bg-lagoon text-white`** (`activeProps`), icônes **`text-lagoon`**
- [ ] Auto-ouverture du module parent selon le `module` de l'URL
- [ ] Tous les libellés via Paraglide `m.*`, **aucune string en dur**
- [ ] Footer : `user.login` + `user.role`, Déconnexion = `LogoutButton` restylé
- [ ] Pas de nouvelle route, pas de nouvelle dépendance, pas d'endpoint inventé
- [ ] `npm run check` et `npm test` restent verts ; build prod OK
