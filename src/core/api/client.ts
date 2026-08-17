import type { ApiClient } from "./http";

/**
 * Porteur du client API singleton.
 *
 * `core/auth/session.ts` construit le client (via `createApiClient`) et
 * l'enregistre ici une seule fois. Les features et les hooks importent
 * `#/core/api` — jamais les internes de la session — ce qui évite toute
 * dépendance circulaire entre `core/api` et `core/auth`.
 *
 * Appeler une fonction API avant l'initialisation est une erreur de
 * configuration (la session est créée au démarrage du router).
 */
let client: ApiClient | null = null;

export function setApiClient(next: ApiClient): void {
	client = next;
}

export function getApiClient(): ApiClient {
	if (!client) {
		throw new Error(
			"Client API non initialisé : la session n’a pas été créée (router context).",
		);
	}
	return client;
}
