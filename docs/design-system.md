# Design System — « Concierge »

Direction : **réception d'hôtel moderne**, pas dashboard SaaS générique.
Trois principes : fond calme et neutre, chaleur ponctuelle (l'orange =
geste, jamais de grandes surfaces), une voix par espace (landing =
spectaculaire, back-office = silencieux et précis, espace client = entre
les deux).

Source de vérité des tokens : `src/styles.css`. Ce document décrit les
conventions ; ne pas contourner avec des valeurs en dur.

## Couleurs

### Marque (ne pas déplacer)

| Token | Clair | Dark | Rôle |
|---|---|---|---|
| `primary` / `lagoon` | `#E67E22` | `#F0954D` | Actions, barre active, accents |
| `foreground` / `sea-ink` | `#1A2B4C` | `#E4ECF8` | Texte, sidebar |
| `background` | `#F4F6F9` | `#0C1420` | Fond de page |
| `card` | `#ffffff` | `#101927` | Surfaces |
| `muted-foreground` | `#5A6985` | `#9DADC4` | Texte secondaire |
| `border` | `#DCE3EC` | `#22314A` | Bordures |

`--color-sea-ink` / `--color-lagoon` / `--color-palm` sont **figés**
(identité sidebar) ; les autres suivent le thème. Utiliser les utilitaires
sémantiques (`bg-card`, `text-muted-foreground`…) — **jamais** de
`bg-[#hex]` dans un composant.

### Statuts sémantiques

Paire fond doux + texte plein, valide dans les deux thèmes :

| Variante | Utilitaires | Sens |
|---|---|---|
| `success` | `bg-success-bg` `text-success` | payé, prêt, actif, validé |
| `warning` | `bg-warning-bg` `text-warning` | en cours, en attente, bientôt dû |
| `info` | `bg-info-bg` `text-info` | déposé, envoyé, réservé |
| `danger` | `bg-danger-bg` `text-danger` | annulé, refusé, impayé, retard |
| `neutral` | `bg-neutral-bg` `text-neutral` | retiré, archivé, brouillon |

Via `<Badge variant="…">` (`components/ui/badge.tsx`) ; les anciennes maps
`bg-[#hex] text-white` sont bannies.

## Typographie

- **Manrope** partout (corps, tables, formulaires).
- **Fraunces** (`display-title`) : réservée aux titres display des espaces
  client-facing (landing, accueil espace client). Pas dans le back-office.

Échelle :

| Élément | Classes |
|---|---|
| Titre de page (`h1`) | `text-2xl font-semibold` |
| Sous-titre de section | `text-base font-semibold` |
| Corps / tableau | `text-sm` |
| Méta / légende | `text-xs` |
| Titre de carte | `text-sm font-semibold` |

Pas de `font-bold` ni de `text-3xl` dans le back-office.

## Espacements & rayons

- Grille 4px Tailwind.
- Page : `w-full space-y-6 p-4 sm:p-6`.
- Barre de filtres : `rounded-lg border border-border bg-card p-4`.
- Cartes : `p-5` (actions) / `p-6` via `CardHeader`/`CardContent`.
- **Rayons** : `rounded-lg` (10px) = défaut partout ; `rounded-xl` =
  cartes client-facing ; `rounded-2xl` = surfaces d'auth uniquement ;
  `rounded-full` = badges, avatars.
- Ombres : `shadow-sm` pour les cartes de liste, `shadow-lg` pour les
  modales. Pas d'ombres colorées dans le back-office.

## Composants

| Besoin | Composant |
|---|---|
| Page standard | `PageHeader` (breadcrumb + titre + description + actions) |
| Statut | `<Badge variant>` — map `statut → variante` dans le module |
| Tableau | `TableShell` / `DataTable` / `DataTableHead` / `Th` / `Tr` / `Td` |
| État vide | `EmptyState` (icône + titre + description + action) |
| Modale | `Dialog` + `DialogContent`/`Header`/`Footer`/`Title`/`Description` |
| Confirmation | `ConfirmDialog` (rebâti sur `ui/dialog`) |
| Champ | `InputField` (label + icône + erreur) |

En-tête de tableau : `bg-muted/60` + `text-muted-foreground` — **jamais**
`bg-sea-ink` plein pot. Lignes : `border-t border-border` +
`hover:bg-accent/40` ; ligne entièrement cliquable = stretched link
(`relative` sur `<tr>`, `after:absolute after:inset-0` sur l'ancre) et
cellule d'actions en `relative z-10`.

## États interactifs

- **Hover** : `hover:bg-accent/40` (lignes, items), `hover:text-foreground`,
  `hover:underline` (liens inline).
- **Focus** : `focus-visible:ring-[3px] focus-visible:ring-ring/50` (fourni
  par `Button`/`Input`/`Select` — ne pas le supprimer).
- **Active** : barre `bg-lagoon` glissante (navbar client), `bg-lagoon/15`
  + barre gauche (sidebar), soulignement `decoration-lagoon` (menu mobile).
- **Disabled** : `disabled:opacity-50` + `disabled:pointer-events-none`.

## Breakpoints

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. Conventions :
- Sidebar back-office : visible `lg+`, tiroir en dessous.
- Navbar client : rangée libellée `xl+`, hamburger en dessous.
- Conteneurs : `max-w-7xl` (espace client, landing), pleine largeur avec
  padding dans le back-office.

## Animations

- **Back-office : silence.** Pas d'animation de fond permanente ; un seul
  halo statique dans `AppBackground`.
- Micro-interactions : `transition-colors` / `transition-all` 150–300 ms,
  `ease-out`. Entrées de page : fondu léger (`animate-in fade-in`), pas de
  mouvement continu sous les données.
- Landing : SplitText, BorderGlow, logo flottant autorisés (vitrine).
- Toujours respecter `prefers-reduced-motion` (`motion-safe:`).
