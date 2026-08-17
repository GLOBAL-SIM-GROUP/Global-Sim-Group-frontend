import { env } from "#/env";
import { ApiError, ApiErrorCode, buildApiError } from "./api-error";

/**
 * Dépendances injectées par la couche auth (anti-dépendance circulaire :
 * `http.ts` ne connaît pas la session, `core/auth/session.ts` construit
 * le client avec ses propres callbacks).
 */
export interface ApiDeps {
	/** Token d'accès courant (ou null si non authentifié). */
	getAccessToken(): string | null;
	/** Tente un rafraîchissement silencieux. false = session expirée. */
	refresh(): Promise<boolean>;
	/** Appelé quand la session est définitivement expirée (401 après refresh). */
	onSessionExpired?(): void;
}

export interface ApiClient {
	/**
	 * Requête typée vers l'API.
	 * @param path  chemin relatif à la base (`/api/v1`), ex. `/auth/login`.
	 */
	apiFetch<T>(path: string, init?: RequestInit): Promise<T>;
}

/**
 * Chemins qui n'exigent jamais de bearer. Le spec déclare (à tort) `login`
 * comme protégé par JWT ; le wrapper ne doit pas attacher de token sur ces
 * endpoints, sinon le login casse.
 */
const NO_AUTH_PATHS = ["/auth/login", "/auth/refresh"];

const DEFAULT_TIMEOUT_MS = 15_000;

export function createApiClient(deps: ApiDeps): ApiClient {
	const baseUrl = env.VITE_API_URL.replace(/\/+$/, "");

	// Single-flight : une seule tentative de refresh concurrente, partagée par
	// toutes les requêtes en cours (les autres 401 attendent la même promesse).
	let refreshing: Promise<boolean> | null = null;

	function refreshSingleFlight(): Promise<boolean> {
		if (!refreshing) {
			refreshing = deps.refresh().finally(() => {
				refreshing = null;
			});
		}
		return refreshing;
	}

	async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
		const requiresAuth = !NO_AUTH_PATHS.some((p) => path.startsWith(p));
		const controller = new AbortController();
		let timedOut = false;
		const timeoutId = setTimeout(() => {
			timedOut = true;
			controller.abort();
		}, DEFAULT_TIMEOUT_MS);

		// Propagation de l'annulation éventuelle de l'appelant.
		if (init.signal) {
			if (init.signal.aborted) controller.abort();
			else
				init.signal.addEventListener("abort", () => controller.abort(), {
					once: true,
				});
		}

		try {
			const headers = new Headers(init.headers);
			headers.set("content-type", "application/json");
			if (requiresAuth) {
				const token = deps.getAccessToken();
				if (token) headers.set("authorization", `Bearer ${token}`);
			}

			let response = await fetch(`${baseUrl}${path}`, {
				...init,
				headers,
				signal: controller.signal,
			});

			if (response.status === 401 && requiresAuth) {
				const refreshed = await refreshSingleFlight();
				if (refreshed) {
					const token = deps.getAccessToken();
					if (token) headers.set("authorization", `Bearer ${token}`);
					response = await fetch(`${baseUrl}${path}`, {
						...init,
						headers,
						signal: controller.signal,
					});
				} else {
					deps.onSessionExpired?.();
				}
			}

			return await unwrap<T>(response);
		} catch (error) {
			if (error instanceof ApiError) throw error;
			if (error instanceof DOMException && error.name === "AbortError") {
				if (timedOut) {
					throw new ApiError({
						status: 0,
						code: ApiErrorCode.TIMEOUT_ERROR,
						message: "La requête a expiré.",
					});
				}
				throw error; // annulation volontaire par l'appelant
			}
			throw new ApiError({
				status: 0,
				code: ApiErrorCode.NETWORK_ERROR,
				message: "Impossible de joindre le serveur.",
			});
		} finally {
			clearTimeout(timeoutId);
		}
	}

	return { apiFetch };
}

async function unwrap<T>(response: Response): Promise<T> {
	const contentType = response.headers.get("content-type") ?? "";
	const isJson = contentType.includes("application/json");
	const body = isJson ? await response.json().catch(() => null) : null;

	if (!response.ok) {
		throw buildApiError(response.status, body);
	}
	return body as T;
}
