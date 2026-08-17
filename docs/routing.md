# Routing (TanStack Router)

Les routes sont des fichiers dans `src/routes/`, régénérés par
`npm run generate-routes` après chaque ajout/suppression.

## Structure actuelle

| Fichier | Route | Rôle |
| --- | --- | --- |
| `src/routes/__root.tsx` | — | Coquille HTML, locale, erreur/404 par défaut, devtools en dev |
| `src/routes/login.tsx` | `/login` | Publique ; redirige vers `/` si déjà connecté |
| `src/routes/_authenticated.tsx` | layout `/_authenticated` | Protégé ; monte `AuthProvider` + `AppShell` |
| `src/routes/_authenticated/index.tsx` | `/` | Accueil protégé minimal (fondation) |

## Guards (`beforeLoad`)

```ts
// core/auth/guards.ts
requireAuth(session)              // → redirect('/login') si non connecté
requirePermissions(session, 'FINANCES.VOIR', ...) // → redirect('/') si refusé
```

```ts
// routes/_authenticated.tsx
beforeLoad: ({ context }) => {
  requireAuth(context.auth)
}
```

Le contexte route expose `{ queryClient, auth }` (voir `router.tsx`). Les
guards lancent `redirect({ href: ... })` — chemin string volontairement non
typé pour ne pas dépendre de l'arbre de routes. `AuthProvider` est monté dans
le layout protégé uniquement : la page de login, publique, accède à la session
via `useRouteContext({ from: '/login' })`.

## Règles

1. Les guards s'appliquent dans `beforeLoad` (exécuté avant le rendu, côté
   client **et** SSR). En SSR, un utilisateur non authentifié est redirigé —
   c'est le comportement attendu pour une app JWT client-side.
2. Les charges de données par route (`loader`) sont réservées aux cas où le
   composant a besoin des données **avant** le premier rendu. Pour le reste :
   TanStack Query (`docs/state-management.md`).
3. `routeTree.gen.ts` est généré, jamais édité.

## À ne pas faire

- ❌ Écrire la logique métier dans une route (aller dans `features/`).
- ❌ Attacher des permissions au rendu seulement : le guard frontend est une
  UX, la sécurité reste au backend (`docs/authorization.md`).
- ❌ Naviguer avec `window.location` (casserait le SPA) — utiliser `useRouter()`
  ou `<Link>`.
