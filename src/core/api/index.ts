/**
 * Frontière API du frontend.
 *
 * Les features importent depuis `#/core/api` uniquement. Aucun `fetch(...)`
 * brut ne doit vivre dans un composant ou une route (spec prompt-adapted.md
 * §10) : tout passe par `createApiClient` (wrapper HTTP) qui gère le bearer,
 * le refresh-on-401, l'enveloppe d'erreur et le timeout.
 *
 * Les types de requête viennent du client OpenAPI généré
 * (`./generated/schema`, régénéré par `npm run api:gen`) ; les types de
 * réponse manquants du spec sont déclarés dans `./types`.
 */
export {
	ApiError,
	ApiErrorCode,
	buildApiError,
	getFieldErrors,
	isApiError,
	toApiError,
} from "./api-error";
export { authApi } from "./auth";
export { getApiClient, setApiClient } from "./client";
export { healthApi } from "./health";
export type { ApiClient, ApiDeps } from "./http";
export { createApiClient } from "./http";
export type {
	ApiErrorEnvelope,
	AuthLoginResponse,
	AuthMeResponse,
	AuthRefreshResponse,
	HealthReadyStatus,
	HealthStatus,
	UtilisateurAuth,
	ValidationErrorDetail,
} from "./types";
