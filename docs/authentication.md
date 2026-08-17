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

Décision projet : **mémoire** (`createMemoryTokenStore`, par défaut).
`createLocalStorageTokenStore` est disponible derrière la même interface
`TokenStorage` si un jour la persistance est souhaitée.

| | Mémoire (choisi) | localStorage |
| --- | --- | --- |
| Survie au reload | Non (re-login) | Oui |
| Surface d'attaque XSS | Réduite (rien en localStorage) | Plus grande |

**Pourquoi ce choix** : les tokens n'existent que pendant la session en
mémoire ; un script injecté (XSS) ne peut pas les lire dans le stockage
persistant. Le compromis : perte de session au refresh de la page.

## Règles

- Les tokens ne sont **jamais** loggés (ni `console`, ni sentry, ni champ UI).
- Aucun token dans le `.env`, le bundle, ou les URLs.
- Le stockage est injectable ; toute feature utilise `useAuth()` /
  `useCurrentUser()` — jamais d'accès direct au `TokenStorage`.

## À ne pas faire

- ❌ Mettre les tokens en localStorage sans décision explicitement validée.
- ❌ Faire un `fetch('/auth/...')` hors du wrapper (`core/api/http.ts`).
- ❌ Ré-implementer le refresh dans une feature (le singleton le fait déjà).
