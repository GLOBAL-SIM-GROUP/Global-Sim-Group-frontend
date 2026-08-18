# Authentification (JWT)

Tout est piloté par `src/core/auth/` : machine à états de session non-React,
utilisée par les guards (`beforeLoad`), le wrapper HTTP et les hooks.

## Cycle de vie

1. **Login** — `POST /auth/login {login, mot_de_passe}` (snake_case, DTO du
   schéma généré) → `{accessToken, accessExpiresIn, refreshToken, refreshExpiresIn, utilisateur}`.
   Puis `GET /auth/me` → `{id, login, role, permissions}` (source des
   permissions, `docs/authorization.md`).
2. **Refresh silencieux** — planifié à `accessExpiresIn - 30 s`, rotation du
   refresh token (le refresh consommé est remplacé, jamais rejoué). Single-flight :
   si plusieurs requêtes reçoivent 401 en parallèle, une seule passe au refresh.
3. **401 sur une requête** — le wrapper (`core/api/http.ts`) tente un refresh
   puis rejoue la requête une fois. Échec → `onSessionExpired()` → purge locale.
4. **Logout** — révocation du refresh token (best-effort) puis purge locale et
   redirection `/login`.

## Stockage des tokens

Décision projet (validée le 2026-08-18) : **persistant** —
`createLocalStorageTokenStore`. La session survit au rechargement de la page :
au démarrage du client, `auth.restore()` relit les tokens persistés, fait un
refresh (rotation) puis `/auth/me` pour rétablir l'utilisateur. En cas d'échec,
le guard `_authenticated` redirige vers `/login?next=…` et la page de login
reconnecte puis renvoie vers l'URL d'origine.

| | Mémoire | localStorage (choisi) |
| --- | --- | --- |
| Survie au reload | Non (re-login) | Oui |
| Surface d'attaque XSS | Réduite (rien en localStorage) | Plus grande |

**Pourquoi ce choix** : la persistance était demandée par l'utilisateur
(session conservée après actualisation). Le compromis : un script injecté
(XSS) pourrait lire les tokens dans le stockage persistant — le refresh
dédupliqué et la rotation stricte côté backend limitent l'exploitation.

## Règles

- Les tokens ne sont **jamais** loggés (ni `console`, ni sentry, ni champ UI).
- Aucun token dans le `.env`, le bundle, ou les URLs.
- Le stockage est injectable ; toute feature utilise `useAuth()` /
  `useCurrentUser()` — jamais d'accès direct au `TokenStorage`.
- La restauration de session passe par `auth.restore()` (dédupliquée avec le
  refresh) — ne jamais rejouer un refresh token (le backend révoque la session).

## À ne pas faire

- ❌ Revenir à la mémoire sans décision explicitement validée.
- ❌ Faire un `fetch('/auth/...')` hors du wrapper (`core/api/http.ts`).
- ❌ Ré-implementer le refresh dans une feature (le singleton le fait déjà).
