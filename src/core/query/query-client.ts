import { QueryClient } from "@tanstack/react-query";
import { ApiErrorCode, isApiError } from "#/core/api/api-error";

/**
 * Singleton QueryClient de l'application.
 *
 * Une seule instance pour tout le cycle de vie (router SSR-query, hooks,
 * devtools). Le wrapper API gère déjà le refresh 401 + `onSessionExpired()` :
 * les relances automatiques de TanStack Query ne doivent **pas** re-tenter les
 * erreurs d'application (4xx, validation, auth) — uniquement les erreurs
 * réseau/transitoires.
 */
const RETRYABLE_CODES: ReadonlySet<string> = new Set([
	ApiErrorCode.NETWORK_ERROR,
	ApiErrorCode.TIMEOUT_ERROR,
]);

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Aucune query ne tourne en SSR : la session (token) vit en mémoire
			// client et les pages protégées redirigent vers /login côté serveur.
			// `VITE_API_URL` peut être relative (`/api/v1/api/v1`), inutilisable depuis Node.
			retry: (_failureCount, error) => {
				if (!isApiError(error)) return false;
				return RETRYABLE_CODES.has(error.code);
			},
			// Données métier : pas de refetch silencieux au retour de fenêtre.
			refetchOnWindowFocus: false,
			staleTime: 30_000,
		},
		mutations: {
			// Les mutations ne se re-jouent jamais seules : on présente l'erreur.
			retry: false,
		},
	},
});

/** Accès au singleton (router, hooks et devtools partagent la même instance). */
export function getQueryClient(): QueryClient {
	return queryClient;
}
