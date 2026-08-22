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
	/**
	 * Télécharge une réponse binaire (ex. rapport `format=pdf`) avec le même
	 * bearer + rafraîchissement sur 401.
	 */
	download(path: string, init?: RequestInit): Promise<Blob>;
	/**
	 * Upload avec FormData (images, fichiers) : ne force pas content-type JSON.
	 * Laisse le navigateur ajouter `multipart/form-data; boundary=...`.
	 */
	uploadForm<T>(path: string, init?: RequestInit): Promise<T>;
}

/**
 * Chemins qui n'exigent jamais de bearer. Le spec déclare (à tort) `login`
 * comme protégé par JWT ; le wrapper ne doit pas attacher de token sur ces
 * endpoints, sinon le login casse.
 */
const NO_AUTH_PATHS = ["/api/v1/auth/login", "/api/v1/auth/refresh"];

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

	// Requête authentifiée partagée : bearer + refresh sur 401 (single-flight,
	// cf. `refreshSingleFlight`).
	function requete(
		path: string,
		init: RequestInit,
		requiresAuth: boolean,
		signal: AbortSignal,
	): Promise<Response> {
		const headers = new Headers(init.headers);
		headers.set("content-type", "application/json");
		if (requiresAuth) {
			const token = deps.getAccessToken();
			if (token) headers.set("authorization", `Bearer ${token}`);
		}

		const executer = () =>
			fetch(`${baseUrl}${path}`, { ...init, headers, signal });

		return (async () => {
			let response = await executer();
			if (response.status === 401 && requiresAuth) {
				const refreshed = await refreshSingleFlight();
				if (refreshed) {
					const token = deps.getAccessToken();
					if (token) headers.set("authorization", `Bearer ${token}`);
					response = await executer();
				} else {
					deps.onSessionExpired?.();
				}
			}
			return response;
		})();
	}

	async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
		const requiresAuth = !NO_AUTH_PATHS.some((p) => path.startsWith(p));
		const { signal, timedOut, timeoutId } = prepareRequete(init);
		try {
			const response = await requete(path, init, requiresAuth, signal);
			return await unwrap<T>(response);
		} catch (error) {
			throw mapperErreur(error, timedOut());
		} finally {
			clearTimeout(timeoutId);
		}
	}

	async function download(path: string, init: RequestInit = {}): Promise<Blob> {
		const requiresAuth = !NO_AUTH_PATHS.some((p) => path.startsWith(p));
		const { signal, timedOut, timeoutId } = prepareRequete(init);
		try {
			const response = await requete(path, init, requiresAuth, signal);
			if (!response.ok) {
				const contentType = response.headers.get("content-type") ?? "";
				const body = contentType.includes("application/json")
					? await response.json().catch(() => null)
					: null;
				throw buildApiError(response.status, body);
			}
			return await response.blob();
		} catch (error) {
			throw mapperErreur(error, timedOut());
		} finally {
			clearTimeout(timeoutId);
		}
	}

	async function uploadForm<T>(path: string, init: RequestInit = {}): Promise<T> {
		const requiresAuth = !NO_AUTH_PATHS.some((p) => path.startsWith(p));
		const { signal, timedOut, timeoutId } = prepareRequete(init);
		try {
			// Pour FormData, on n'ajoute PAS content-type JSON — le navigateur ajoute
			// multipart/form-data + boundary automatiquement.
			const headers = new Headers(init.headers);
			if (requiresAuth) {
				const token = deps.getAccessToken();
				if (token) headers.set("authorization", `Bearer ${token}`);
			}

			const executer = () =>
				fetch(`${baseUrl}${path}`, { ...init, headers, signal });

			let response = await executer();
			if (response.status === 401 && requiresAuth) {
				const refreshed = await refreshSingleFlight();
				if (refreshed) {
					const token = deps.getAccessToken();
					if (token) headers.set("authorization", `Bearer ${token}`);
					response = await executer();
				} else {
					deps.onSessionExpired?.();
				}
			}

			return await unwrap<T>(response);
		} catch (error) {
			throw mapperErreur(error, timedOut());
		} finally {
			clearTimeout(timeoutId);
		}
	}

	return { apiFetch, download, uploadForm };
}

/**
 * Prépare un AbortController avec timeout : retourne le signal, une fonction
 * `timedOut()` et l'id du timer (à libérer par l'appelant).
 */
function prepareRequete(init: RequestInit): {
	signal: AbortSignal;
	timedOut: () => boolean;
	timeoutId: ReturnType<typeof setTimeout>;
} {
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
	return { signal: controller.signal, timedOut: () => timedOut, timeoutId };
}

function mapperErreur(error: unknown, timedOut: boolean): never {
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
