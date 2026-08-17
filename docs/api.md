# Couche API

Backend : **NestJS + PostgreSQL**, déployé en dev sur
`https://dev.sim.strife-cyber.org` (spec OpenAPI live à `/docs-json`). Le
frontend est client-only : tout appel part de `src/core/api`.

## Flux

1. `npm run api:gen` télécharge la spec et génère `src/core/api/generated/schema.ts`
   (`openapi-typescript`). Les **types de requête** (DTO, snake_case) en sont
   importés — jamais dupliqués.
2. La spec ne déclare **pas** les schémas de réponse (sauf health) ni
   l'enveloppe d'erreur : ces types sont déclarés à la main dans
   `src/core/api/types.ts` (source : observations du backend réel, à revalider
   au smoke test / aux tests d'intégration).
3. `createApiClient({ getAccessToken, refresh, onSessionExpired })` (construit
   par `core/auth/session.ts`) expose `apiFetch<T>(path, options)`.

## Wrapper HTTP (`apiFetch`)

- Base URL depuis `VITE_API_URL` (défaut `/api/v1`, même origine). En dev, le
  proxy du `vite.config.ts` relaie `/api/*` vers le backend
  (`https://dev.sim.strife-cyber.org`) — le CORS de ce backend refuse
  `localhost:*`, un appel direct depuis le navigateur serait bloqué.
- JSON en entrée/sortie ; en-tête `Authorization: Bearer <accessToken>` ajouté
  **sauf** sur `NO_AUTH_PATHS = ['/auth/login', '/auth/refresh']`.
- Timeout `AbortController` de **15 s**.
- Réponse HTTP : l'enveloppe `{success, code, message, details?, requestId?, path?, timestamp?}`
  est dépaquetée en `ApiError` (`status`, `code`, `details`, …).
- **401** → refresh single-flight → rejoue la requête une fois → en cas
  d'échec `onSessionExpired()` (purge session).
- Les tokens ne sont **jamais** loggés.

## Particularité du spec à connaître

Le spec déclare `POST /auth/login` (et `/auth/refresh`) comme protégés par
JWT — un **artefact** du backend. Le wrapper n'attache donc jamais de bearer
sur ces deux chemins.

## Filtres `required` erronés

Certains endpoints listent des paramètres de requête `required` à tort
(ex. `residence/logements`, `client/clients`, `audit/journal`). Sans impact
sur la fondation ; à traiter feature par feature lors de l'implémentation
des modules.

## Erreurs (`ApiError`)

```ts
try {
  await authApi.login(dto)
} catch (error) {
  const apiError = toApiError(error)
  getErrorMessageForCode(apiError.code)   // code → message i18n (docs/internationalization.md)
  getFieldErrors(error)                    // details[].property → erreurs de formulaire
}
```

## À ne pas faire

- ❌ `fetch()` brut hors de `core/api/http.ts`.
- ❌ Dupliquer un DTO du schéma généré.
- ❌ Attacher le bearer sur `/auth/login` ou `/auth/refresh`.
- ❌ Logger des tokens ou des corps de réponse sensibles.
