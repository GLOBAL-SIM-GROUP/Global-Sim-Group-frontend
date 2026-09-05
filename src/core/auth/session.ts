import {
	type AuthMeResponse,
	authApi,
	createApiClient,
	isApiError,
	setApiClient,
} from "#/core/api";
import { clearSessionHint, markSessionHint } from "./session-hint";
import {
	createMemoryTokenStore,
	type StoredTokens,
	type TokenStorage,
} from "./token-store";

/** Marges de sécurité avant l'expiration réelle de l'access token (secondes). */
const REFRESH_MARGIN_S = 30;

/** Délai avant de retenter un refresh après une erreur réseau/timeout (secondes). */
const NETWORK_RETRY_DELAY_S = 15;

/**
 * `true` si l'échec du refresh vient d'une vraie réponse du backend (401 :
 * refresh token expiré/révoqué — la session est réellement finie). `false`
 * pour une erreur réseau/timeout (`status: 0`, cf. `mapperErreur` dans
 * `http.ts`) : la requête n'a même pas atteint le serveur, le refresh token
 * est probablement toujours valide — ne pas déconnecter l'utilisateur pour
 * un accroc réseau passager.
 */
function estRefusParLeBackend(error: unknown): boolean {
	return isApiError(error) && error.status !== 0;
}

/**
 * Nom du verrou Web Locks API (partagé par tous les onglets/PWA de même
 * origine) protégeant le rafraîchissement contre une course INTER-onglets.
 * `refreshInFlight` ne protège que les appels concurrents dans le MÊME
 * onglet ; deux onglets peuvent lire le même refresh token en mémoire et
 * l'envoyer chacun de son côté — le backend révoque alors toute la session
 * en détectant la réutilisation. `navigator.locks` sérialise l'exécution
 * entre onglets sans le TOCTOU d'un verrou maison en localStorage.
 */
const REFRESH_LOCK_NAME = "sim-auth-refresh";

/** Exécute `fn` sous le verrou inter-onglets si l'API est disponible (repli : exécution directe — SSR, tests, anciens navigateurs). */
function withCrossTabLock<T>(fn: () => Promise<T>): Promise<T> {
	if (typeof navigator === "undefined" || !navigator.locks) {
		return fn();
	}
	return navigator.locks.request(REFRESH_LOCK_NAME, () => fn());
}

export interface AuthSessionSnapshot {
	isAuthenticated: boolean;
	user: AuthMeResponse | null;
}

export interface AuthSession {
	readonly isAuthenticated: boolean;
	readonly user: AuthMeResponse | null;
	login(login: string, motDePasse: string): Promise<void>;
	logout(): Promise<void>;
	/** Rafraîchit la session (rotation). false = session expirée. */
	refresh(): Promise<boolean>;
	/**
	 * Restaure la session depuis les tokens persistés (au démarrage du client) :
	 * refresh + `/api/v1/auth/me` → utilisateur rétabli sans reconnexion manuelle.
	 */
	restore(): Promise<void>;
	handleSessionExpired(): void;
	subscribe(listener: () => void): () => void;
	getSnapshot(): AuthSessionSnapshot;
	/**
	 * Lecture synchrone de l'access token courant (ex. handshake `auth` d'un
	 * WebSocket). Ne JAMAIS logger la valeur retournée.
	 */
	getAccessToken(): string | null;
	/**
	 * S'abonne à chaque rotation de l'access token (login ET refresh silencieux
	 * réussi) — contrairement à `subscribe`, qui ne notifie que les transitions
	 * authentifié/non-authentifié. Utile pour reconnecter un WebSocket avec un
	 * token frais sans attendre une déconnexion.
	 */
	subscribeTokenChange(listener: () => void): () => void;
}

export interface CreateAuthSessionOptions {
	tokenStorage?: TokenStorage;
}

/**
 * Machine à états de session (non-React, pour les guards et le wrapper HTTP).
 *
 * Responsabilités (prompt-adapted.md §8) :
 * - login → `POST /auth/login` + chargement de `/api/v1/auth/me` ;
 * - refresh silencieux planifié sur `accessExpiresIn` (seuil -30 s, réarmé) ;
 * - rotation : le refresh token consommé est remplacé (jamais rejoué) ;
 * - logout → révocation best-effort + purge locale ;
 * - les tokens ne sont JAMAIS loggés.
 *
 * Construit et enregistre le client API singleton (`core/api`), en injectant
 * ses dépendances (`getAccessToken`, `refresh`) — c'est le point unique qui
 * brise la dépendance circulaire api ↔ auth.
 */
export function createAuthSession(
	options: CreateAuthSessionOptions = {},
): AuthSession {
	const tokenStorage = options.tokenStorage ?? createMemoryTokenStore();
	const listeners = new Set<() => void>();
	const tokenListeners = new Set<() => void>();

	let currentUser: AuthMeResponse | null = null;
	let refreshTimer: ReturnType<typeof setTimeout> | null = null;
	// Anti-course : le refresh planifié et le refresh déclenché par un 401
	// partagent la même promesse — le backend RÉVOQUE la session si un refresh
	// token est rejoué, un double refresh concurrent déconnecterait l'utilisateur.
	let refreshInFlight: Promise<boolean> | null = null;
	// Anti-course : évite les restaurations dupliquées au démarrage (beforeLoad
	// appelé sur chaque navigation protégée — on réutilise la promesse précédente).
	let restoreInFlight: Promise<void> | null = null;
	// Snapshot référentiellement stable (indispensable à useSyncExternalStore).
	let snapshot: AuthSessionSnapshot = { isAuthenticated: false, user: null };

	function emit(): void {
		for (const listener of listeners) listener();
	}

	function setUser(next: AuthMeResponse | null): void {
		currentUser = next;
		snapshot = { isAuthenticated: next !== null, user: next };
		emit();
	}

	function storeTokens(tokens: StoredTokens): void {
		tokenStorage.set(tokens);
		markSessionHint(tokens.refreshExpiresIn);
		for (const listener of tokenListeners) listener();
	}

	function scheduleRefresh(accessExpiresIn: number): void {
		if (refreshTimer) clearTimeout(refreshTimer);
		const delayMs = Math.max(0, (accessExpiresIn - REFRESH_MARGIN_S) * 1000);
		refreshTimer = setTimeout(() => {
			void refresh();
		}, delayMs);
	}

	/** Reprogramme un refresh proche après un échec réseau/timeout (pas une vraie expiration). */
	function scheduleNetworkRetry(): void {
		if (refreshTimer) clearTimeout(refreshTimer);
		refreshTimer = setTimeout(() => {
			void refresh();
		}, NETWORK_RETRY_DELAY_S * 1000);
	}

	function handleSessionExpired(): void {
		if (refreshTimer) {
			clearTimeout(refreshTimer);
			refreshTimer = null;
		}
		tokenStorage.clear();
		clearSessionHint();
		setUser(null);
	}

	/**
	 * Synchronise cet onglet quand un AUTRE onglet modifie le storage partagé
	 * (`storage` ne se déclenche jamais dans l'onglet auteur du changement) :
	 * - tokens purgés ailleurs (logout, session révoquée) → se déconnecte aussi ;
	 * - tokens renouvelés ailleurs → réarme le minuteur sur la nouvelle
	 *   expiration, pour éviter que ce même onglet ne tente à son tour un
	 *   refresh proche dans le temps (réduit la fenêtre de course, en plus du
	 *   verrou inter-onglets de `doRefresh`).
	 */
	function handleStorageEvent(): void {
		const tokens = tokenStorage.get();
		if (!tokens) {
			if (currentUser) handleSessionExpired();
			return;
		}
		scheduleRefresh(tokens.accessExpiresIn);
	}

	async function login(login: string, motDePasse: string): Promise<void> {
		const response = await authApi.login({ login, mot_de_passe: motDePasse });
		storeTokens({
			accessToken: response.accessToken,
			accessExpiresIn: response.accessExpiresIn,
			refreshToken: response.refreshToken,
			refreshExpiresIn: response.refreshExpiresIn,
		});
		const me = await authApi.me();
		setUser(me);
		scheduleRefresh(response.accessExpiresIn);
	}

	async function doRefresh(): Promise<boolean> {
		const tokensAvant = tokenStorage.get();
		if (!tokensAvant) return false;
		const refreshTokenAvant = tokensAvant.refreshToken;

		return withCrossTabLock(async () => {
			// Un autre onglet a pu rafraîchir pendant l'attente du verrou : adopter
			// ses tokens plutôt que de rejouer l'ancien refresh token (rejeté par
			// le backend comme réutilisation → révocation de toute la session).
			const tokensActuels = tokenStorage.get();
			if (!tokensActuels) return false; // session révoquée entre-temps
			if (tokensActuels.refreshToken !== refreshTokenAvant) {
				scheduleRefresh(tokensActuels.accessExpiresIn);
				return true;
			}

			try {
				const response = await authApi.refresh({
					refresh_token: tokensActuels.refreshToken,
				});
				storeTokens({
					accessToken: response.accessToken,
					accessExpiresIn: response.accessExpiresIn,
					refreshToken: response.refreshToken,
					refreshExpiresIn: response.refreshExpiresIn,
				});
				scheduleRefresh(response.accessExpiresIn);
				return true;
			} catch (error) {
				if (estRefusParLeBackend(error)) {
					// Le backend a explicitement rejeté ce refresh token (401 —
					// expiré/révoqué/déjà consommé) : la session est réellement finie.
					handleSessionExpired();
				} else {
					// Erreur réseau/timeout : la requête n'a pas atteint le backend, le
					// refresh token est probablement toujours valide. Ne PAS déconnecter
					// pour un accroc réseau passager — retente bientôt, tokens conservés.
					scheduleNetworkRetry();
				}
				return false;
			}
		});
	}

	async function refresh(): Promise<boolean> {
		if (refreshInFlight) return refreshInFlight;
		refreshInFlight = doRefresh().finally(() => {
			refreshInFlight = null;
		});
		return refreshInFlight;
	}

	async function restore(): Promise<void> {
		if (currentUser) {
			return;
		}
		if (restoreInFlight) {
			return await restoreInFlight;
		}
		// SSR : pas de localStorage ni de tokens — la restauration est côté client.
		if (typeof window === "undefined") {
			return;
		}
		const tokens = tokenStorage.get();
		if (!tokens) {
			return;
		}

		restoreInFlight = (async () => {
			try {
				const refreshed = await refresh();
				if (refreshed) {
					const me = await authApi.me();
					setUser(me);
				}
			} catch {
				handleSessionExpired();
			}
		})().finally(() => {
			restoreInFlight = null;
		});

		await restoreInFlight;
	}

	async function logout(): Promise<void> {
		const tokens = tokenStorage.get();
		if (tokens) {
			// Best-effort : on révoque le refresh côté serveur, puis purge locale.
			try {
				await authApi.logout({ refresh_token: tokens.refreshToken });
			} catch {
				// La révocation distante échouée ne doit pas bloquer le logout local.
			}
		}
		handleSessionExpired();
	}

	const session: AuthSession = {
		get isAuthenticated(): boolean {
			return currentUser !== null;
		},
		get user(): AuthMeResponse | null {
			return currentUser;
		},
		login,
		logout,
		refresh,
		restore,
		handleSessionExpired,
		subscribe(listener: () => void): () => void {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		getSnapshot(): AuthSessionSnapshot {
			return snapshot;
		},
		getAccessToken(): string | null {
			return tokenStorage.get()?.accessToken ?? null;
		},
		subscribeTokenChange(listener: () => void): () => void {
			tokenListeners.add(listener);
			return () => {
				tokenListeners.delete(listener);
			};
		},
	};

	// Construction du client API singleton, une seule fois.
	setApiClient(
		createApiClient({
			getAccessToken: () => tokenStorage.get()?.accessToken ?? null,
			refresh: () => session.refresh(),
		}),
	);

	// Sync inter-onglets — absent en SSR (pas de `window`) ; sans effet quand
	// `tokenStorage` est en mémoire (rien à recevoir d'un autre onglet).
	if (typeof window !== "undefined") {
		window.addEventListener("storage", handleStorageEvent);
	}

	return session;
}
