# PROMPT CLAUDE CODE — FOND DE LA PAGE DE CONNEXION (GLOBAL SIM GROUP)

> Ce prompt décrit une **modification ciblée de la page existante**, pas une
> création. La page `/login` existe déjà et fonctionne (auth réelle, i18n FR/EN,
> gestion d'erreurs) — voir `src/routes/login.tsx`. La tâche : aligner le **fond**
> de cette page sur la maquette (dégradé vert/teal + carte blanche centrée),
> **sans toucher au formulaire, aux icônes, ni à la logique métier**.

---

## ⚠ IMPORTANT — l'image de la maquette n'est PAS visible

Claude Code reçoit l'image jointe comme `[Unsupported Image]` : **elle n'est pas
lisible par l'exécuteur**. Toute la spec de rendu est donc portée par **la
description écrite ci-dessous** (§ Mission + § Rendu attendu). L'exécuteur doit
servir la page et **itérer avec l'utilisateur** sur l'intensité exacte du
dégradé jusqu'à validation visuelle humaine. Ne pas inventer de couleurs hors
de la palette (§ Palette).

## ⚠ Décisions à trancher AVANT toute implémentation

1. **Portée du changement — CONFLIT dans le prompt d'origine.** Le fond est
   globalement stylé par `body` dans `src/styles.css` : le modifier changerait
   **toutes** les pages de l'application, pas seulement le login. La maquette
   ne concerne que la page de connexion.
   → **Recommandé** : fond **scopé à la route `/login`** (gradient posé sur le
   `<main>` du login, via une classe dédiée dans `src/styles.css` **ou** des
   utilitaires Tailwind dans `src/routes/login.tsx`). `body` reste inchangé.
   Si un fond global est réellement voulu, il doit être validé séparément pour
   tout le site — hors scope de ce prompt.
2. **Éléments décoratifs globaux de `body`** : `body::before` (halos radiaux
   doux, opacité 0.28) et `body::after` (fine grille 28px masquée par un
   radial, opacité 0.14). La maquette d'un écran de login n'a probablement pas
   la grille. → **Recommandé** : garder les halos (subtils, font partie de la
   marque), **laisser la grille hors du fond du login** (le fond scopé la
   recouvre). Ne pas supprimer les pseudo-éléments globaux.
3. **Charte** : teal/vert uniquement (tokens existants). **Pas de bleu nuit,
   pas d'orange.** Les tokens shadcn oklch (`--chart-*`, `--ring`, etc.) ne
   sont pas des couleurs de fond — ne pas les utiliser pour le gradient.

---

## Contexte (état réel du projet)

- **Fond actuel** — `src/styles.css`, règle `body` (lignes ~166-179) :
  un **empilement de 4 calques** :
  - 3 dégradés radiaux décoratifs (halos teal `--hero-a`, palm `--hero-b`, teal
    bas de page) ;
  - **1 dégradé vertical** `linear-gradient(180deg, mix(--sand 68%, white) 0%,
    --foam 44%, --bg-base 100%)` — du vert pâle vers un vert pâle. Il n'y a
    **aucun vert profond** dans le fond actuel.
- **Palette réelle disponible** (tokens déjà définis, à utiliser tels quels) :
  `--sea-ink: #173a40` (vert profond), `--sea-ink-soft: #416166`,
  `--lagoon: #4fb8b2` (teal), `--lagoon-deep: #328f97`, `--palm: #2f6a4a`,
  `--sand: #e7f0e8`, `--foam: #f3faf5`, `--bg-base: #e7f3ec`,
  `--hero-a`, `--hero-b`. Des variantes dark existent pour tous ces tokens.
- **Piège cascade** : un bloc `@layer base` en fin de `styles.css`
  (~lignes 339-347) redéclare `body { background-color: var(--background) }`
  (blanc oklch). Les règles **hors layer** gagnent aujourd'hui — toute nouvelle
  règle de fond doit rester hors layer (ou en utilitaires Tailwind), sinon
  l'ordre des layers peut surprendre.
- **Page `/login`** — `src/routes/login.tsx` : `<main className="flex
  min-h-dvh items-center justify-center p-6">` (aucun fond propre) → la carte
  `bg-card` blanche est déjà centrée, le fond de `body` apparaît derrière.
  Un fond posé sur `<main>` (min-h-dvh, opaque) recouvrira entièrement `body`.
- **Tests** : `src/routes/login.test.tsx` (Vitest + testing-library) couvre le
  flux — sélecteurs `getByLabelText`, `button` nommé, `role="alert"`. Ajouter
  une classe sur `<main>` ne les casse pas.

## Mission

Alignement **visuel seul** du fond de la page `/login` sur la maquette :
un **dégradé vert/teal** derrière une **carte blanche centrée**. Aucun
changement de formulaire, d'icônes, de composants, d'auth, d'i18n ni de tests.

## Rendu attendu (spec écrite de la maquette)

- **Dégradé** : direction verticale (légèrement diagonal autorisé), dans les
  **tons vert/teal de la palette**, du **haut clair/menthe** vers le **bas plus
  profond** (teal/vert océan). L'intensité et le point de bascule exacts sont à
  proposer à partir des tokens, puis à **confirmer visuellement avec
  l'utilisateur** (l'image n'est pas lisible par l'exécuteur).
- **Carte** : déjà blanche (`bg-card`), centrée — **ne rien changer**.
- **Contraste** : le formulaire doit rester lisible sur le fond retenu
  (la carte est opaque, le risque est faible).
- **Dark mode** : utiliser les tokens qui existent en variante dark
  (`--sand`, `--foam`, `--bg-base`, `--hero-a/--hero-b`) pour que le rendu ne
  casse pas en `.dark`. La maquette est en clair — le light reste la cible.

## 1. Modification autorisée

- **Fond scopé au login** (approche recommandée) :
  - soit une classe dédiée (ex. `.login-bg`) dans `src/styles.css`, appliquée
    sur le `<main>` du login — dégradé vertical construit **uniquement avec les
    tokens de la palette** (pas de couleur hex hardcodée hors palette) ;
  - soit des utilitaires Tailwind sur `<main>` (`bg-[linear-gradient(...)]`
    référençant `var(--...)`) si la classe n'est pas justifiée.
- Le `<main>` couvre toute la hauteur (`min-h-dvh` existant) → le gradient
  recouvre `body`. Les pseudo-éléments globaux `body::before`/`::after`
  restent en place (recouverts sur le login, inchangés ailleurs).

## À ne pas faire

- ❌ Modifier le fond global de `body` (impacterait toutes les pages).
- ❌ Introduire la charte bleu nuit / orange / toute couleur hors palette.
- ❌ Toucher au formulaire, aux icônes, à `PasswordInput`/`InputField`, aux
  boutons, aux messages i18n, à la logique d'auth (`core/`), au test
  `login.test.tsx`.
- ❌ Ajouter des composants, fichiers ou routes superflus (pas de
  `LoginBackground.tsx`, pas de lib d'animation, pas d'image de fond).
- ❌ Ajouter des couleurs hex hardcodées non présentes dans la palette.

## Qualité (obligatoire avant de conclure)

- `npm run check` (Biome + `tsc --noEmit`) vert.
- `npm test` vert (depuis le dossier frontend).
- Servir la page (dev ou build + `node server.mjs`) et laisser l'utilisateur
  **vérifier visuellement** que le fond correspond à la maquette ; itérer sur
  l'intensité/direction du dégradé si besoin. **L'exécuteur ne peut pas faire
  de capture d'écran** : le rendu final est validé par l'utilisateur.

## Livrable

1. Le fond de `/login` aligné sur la maquette (classe ou utilitaires, palette
   uniquement), `body` et le reste de la page intacts.
2. `npm run check` + `npm test` verts.
3. Description courte des choix (direction du dégradé, tokens utilisés) pour
   faciliter la confirmation visuelle.
