# PROMPT CLAUDE CODE — ALIGNEMENT VISUEL DE LA PAGE DE CONNEXION (GLOBAL SIM GROUP)

> Ce prompt décrit une **modification de la page existante**, pas une création.
> La page `/login` existe déjà et fonctionne (auth réelle, i18n FR/EN, gestion
> d'erreurs) — voir `src/routes/login.tsx`. La tâche : l'aligner sur la maquette
> fournie, en extrayant ce qui mérite de l'être, sans casser le flux existant.

---

## ⚠ Décisions à trancher AVANT toute implémentation

1. **Charte graphique — CONFLIT.**
   La maquette impose bleu nuit `#1A2B4C` + orange `#E67E22`. Le thème existant
   de l'application est **teal/vert** (`--sea-ink: #173a40`, `--lagoon: #4fb8b2`,
   `--palm: #2f6a4a`, fond dégradé vert pâle), défini dans `src/styles.css`
   (tokens shadcn en oklch + variantes custom). **Aucun élément du projet
   n'utilise le bleu nuit ou l'orange.**
   → **Recommandé** : conserver les tokens existants (l'override de charte
   toucherait toute l'application, pas juste le login). L'implémentation
   n'utilisera que les tokens existants. Si la charte bleu/orange est
   réellement voulue, elle doit d'abord être validée comme override global du
   thème — hors scope de ce prompt.
2. **« Mot de passe oublié ? »** — **aucune route ni endpoint n'existe** pour
   ça. Ne pas inventer `/forgot-password` (règle du projet : pas d'endpoint ni
   de fonctionnalité inventés). Le lien est **hors scope**, sauf demande
   explicite d'ajouter un vrai flux.
3. **Stockage des tokens** — décision produit actée : **jamais en
   `localStorage`** (mémoire uniquement, trade-off XSS documenté). Ne pas
   introduire de persistance.
4. **Redirection post-login** — vers `/` (accueil protégé). Il n'existe pas de
   redirection par rôle : l'UI s'affiche selon les **permissions** (48 codes
   `MODULE.VERBE` chargés par `/auth/me`), pas selon le rôle seul.

---

## Contexte (état réel du projet)

- **Stack réelle** : React 19 · TanStack Router (routing **file-based**,
  guards `beforeLoad`) · TanStack Form · TanStack Query · **Paraglide** i18n
  FR/EN · **shadcn/ui** + Tailwind v4 (tokens dans `src/styles.css`) · lucide-react
  (icônes) · Biome (lint/format) · Vitest.
- **Structure réelle** : `src/routes/` (les pages SONT des routes) ·
  `src/core/` (api, auth, i18n, query, permissions — réutilisable) ·
  `src/components/ui/` (composants shadcn) · `src/features/` (modules métier,
  vide pour l'instant).
- **Backend réel** : NestJS déployé, `POST /api/v1/auth/login` avec
  `{ login, mot_de_passe }` (snake_case, champ login = identifiant, pas email).
  JWT **custom avec rotation** (refresh single-flight, révocation au logout),
  enveloppe d'erreur `{ success, code, message, details[], requestId, path,
  timestamp }`.
- **La page `/login` existe** (`src/routes/login.tsx`) : guard (déjà connecté →
  redirection `/`), formulaire TanStack Form, messages Paraglide, mapping des
  erreurs backend champ par champ (`details[].property`), erreur globale sinon.
- **Défaut i18n : français** ; l'anglais est fourni par `messages/en.json`.

## Mission

Aligner la page `/login` existante sur la maquette (structure, hiérarchie,
icônes, états), **en réutilisant l'existant** : le flux d'auth
(`core/auth`/`core/api`), les messages Paraglide, les composants shadcn.
Aucune nouvelle fonctionnalité métier, aucune nouvelle route, aucun endpoint
inventé.

## 1. Design et structure (tokens EXISTANTS, pas la charte de la maquette)

- **Layout** : page pleine hauteur, carte centrée. Le fond dégradé teal/vert
  est déjà porté par `body` dans `src/styles.css` — ne pas re-styler le fond.
- **Carte** : fond `--card`, largeur max ~420 px, `rounded-xl`, ombre légère,
  padding généreux (cf. `shadow-sm` actuel). Reprendre les tokens shadcn
  (`bg-card`, `text-card-foreground`, `text-muted-foreground`, `border`).
- **En-tête** : logo + titre de la marque (« GLOBAL SIM GROUP », `m.app_name()`)
  en `--primary`, avec le slogan sous le titre (`m.auth_login_subtitle()`),
  couleur `text-muted-foreground`.
- **Titre de la carte** : « Connexion » (`m.auth_login_title()`), gras,
  hiérarchie visuelle claire.
- **Formulaire** : reprendre les champs existants (login/mot de passe) et
  ajouter les icônes lucide (`User`, `Lock`, `Eye`/`EyeOff`) et un **toggle de
  visibilité** sur le mot de passe. Labels via les messages Paraglide existants
  (`m.auth_login_label_login()`, `m.auth_login_label_password()`).
- **Bouton** : `Button` shadcn existant, pleine largeur, `variant="default"`
  (déjà `--primary`). Pendant la soumission : état désactivé + indicateur
  (spinner lucide `Loader2` `animate-spin`, ou le libellé « Connexion… »
  existant `m.auth_login_pending()`). Le texte du bouton est déjà i18n.
- **Footer** : « © 2026 GLOBAL SIM GROUP. Tous droits réservés. » — **nouveau
  message Paraglide** (fr + en), taille 12 px, centré, `text-muted-foreground`.
- **Erreurs** : conserver le mapping existant — erreur sous le champ concerné
  (`text-destructive`) + erreur globale (`role="alert"`).

## 2. Composants — réutiliser d'abord, extraire si justifié

La règle du projet : pas de découpage gratuit. La page reste une route fine
dans `src/routes/login.tsx`. Extractions **uniquement** si réutilisables :

1. `src/components/ui/password-input.tsx` (nouveau, style shadcn) — champ
   mot de passe avec toggle de visibilité, typé (`forwardRef`), props label /
   error / etc. Réutilisable partout.
2. Optionnel : `src/components/ui/input-field.tsx` (label + icône + erreur) si
   le motif se répète (login + mot de passe). Ne pas l'extraire sinon.
3. **Ne PAS créer** : `LoginLayout`, `LoginCard`, `LoginForm`, `LoginButton`,
   `LoadingSpinner` dédiés, ni de dossier `pages/Login/`. Aucun composant
   `core/` (auth, api, i18n) ne doit être dupliqué ni réécrit.

Icônes : **lucide-react** (déjà installé). `Button`/`Input`/`Label` :
`src/components/ui/` existants.

## 3. Logique métier — inchangée, à conserver telle quelle

- **Pas de React Hook Form, pas d'axios, pas de fetch brut.** Le formulaire
  reste TanStack Form ; l'appel passe par `auth.login(login, motDePasse)` du
  contexte route (`core/auth/session.ts` → `authApi.login` dans `core/api`).
- **Validation** : conserver les règles actuelles (champs requis, messages
  i18n existants). **Ne pas inventer** de règle de longueur min. Le backend
  reste la frontière de validation.
- **Réponse** : succès → `navigate({ to: "/" })` (accueil protégé). Échec →
  mapping `details[].property` → champ, sinon erreur globale
  (`getErrorMessageForCode` → fallback i18n).
- **Token** : mémoire uniquement, refresh automatique (déjà câblé). Rien à
  toucher.

## 4. Standards de code (à respecter)

- **TypeScript strict**, tout est typé (props, erreurs, réponse API).
- **i18n** : **zéro string en dur** — tout texte visible passe par les messages
  Paraglide `m.*` (fr + en). Les messages i18n sont complétés dans
  `messages/fr.json` et `messages/en.json`, puis régénérés (`npm run i18n:compile`,
  ou le plugin Vite le fait au build).
- **Structure** : couches existantes respectées — routes dans `src/routes/`,
  UI réutilisable dans `src/components/ui/`, logique dans `src/core/`. Aucune
  top-level `/modules`, `/services`, `/hooks`, `/types`, `/utils` à créer.
- **Styles** : Tailwind + tokens shadcn uniquement (classes utilitaires, pas de
  CSS-in-JS).
- **Accessibilité** : `htmlFor`/`id` sur les labels, `aria-label` sur les
  boutons d'icône, `autoComplete` correct (username / current-password),
  `role="alert"` sur l'erreur globale, contraste respecté.
- **Conventions** : français/snake_case côté données backend, messages
  Paraglide nommés `auth_login_*`.

## 5. Qualité (obligatoire avant de conclure)

- `npm run check` (Biome + `tsc --noEmit`) vert, aucune erreur.
- `npm run generate-routes` si la route change (pas attendu ici).
- `npm test` vert (le test `login.test.tsx` couvre déjà le flux — l'adapter
  seulement si le DOM change).
- Vérifier visuellement : FR et EN, état chargement, erreur champ + erreur
  globale, contraste, responsive (mobile).

## À ne pas faire

- ❌ Créer la page depuis zéro / un dossier `pages/Login/`.
- ❌ Utiliser React Hook Form, axios, fetch brut, localStorage.
- ❌ Introduire la charte bleu nuit/orange sans override global validé.
- ❌ Ajouter « Mot de passe oublié ? » (aucune route/endpoint réel).
- ❌ Rediriger par rôle ou vers un `/dashboard` qui n'existe pas.
- ❌ Toucher à `core/` (auth, api, i18n, query) ni dupliquer ses types.
- ❌ Hardcoder du texte, dupliquer les DTO générés, inventer des règles.

## Livrable

1. `src/routes/login.tsx` mis à jour (aligné maquette, flux intact).
2. `src/components/ui/password-input.tsx` (+ `input-field.tsx` si justifié).
3. Messages Paraglide complétés (fr + en), `src/paraglide/` régénéré.
4. `npm run check` + `npm test` verts, capture/description du rendu.
