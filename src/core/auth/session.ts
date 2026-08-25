import {
	type AuthMeResponse,
	authApi,
	createApiClient,
	setApiClient,
} from "#/core/api";
import {
	createMemoryTokenStore,
	type StoredTokens,
	type TokenStorage,
} from "./token-store";

/** Marges de sécurité avant l'expiration réelle de l'access token (secondes). */
const REFRESH_MARGIN_S = 30;

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
 * ses dépendances (`getAccessToken`, `refresh`, `onSessionExpired`) — c'est le
 * point unique qui brise la dépendance circulaire api ↔ auth.
 */
export function createAuthSession(
	options: CreateAuthSessionOptions = {},
): AuthSession {
	const tokenStorage = options.tokenStorage ?? createMemoryTokenStore();
	const listeners = new Set<() => void>();

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
	}

	function scheduleRefresh(accessExpiresIn: number): void {
		if (refreshTimer) clearTimeout(refreshTimer);
		const delayMs = Math.max(0, (accessExpiresIn - REFRESH_MARGIN_S) * 1000);
		refreshTimer = setTimeout(() => {
			void refresh();
		}, delayMs);
	}

	function handleSessionExpired(): void {
		if (refreshTimer) {
			clearTimeout(refreshTimer);
			refreshTimer = null;
		}
		tokenStorage.clear();
		setUser(null);
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
		const tokens = tokenStorage.get();
		if (!tokens) return false;
		try {
			const response = await authApi.refresh({
				refresh_token: tokens.refreshToken,
			});
			storeTokens({
				accessToken: response.accessToken,
				accessExpiresIn: response.accessExpiresIn,
				refreshToken: response.refreshToken,
				refreshExpiresIn: response.refreshExpiresIn,
			});
			scheduleRefresh(response.accessExpiresIn);
			return true;
		} catch {
			handleSessionExpired();
			return false;
		}
	}

	async function refresh(): Promise<boolean> {
		if (refreshInFlight) return refreshInFlight;
		refreshInFlight = doRefresh().finally(() => {
			refreshInFlight = null;
		});
		return refreshInFlight;
	}

	async function restore(): Promise<void> {
		console.log("[Auth] restore() called");
		if (currentUser) {
			console.log("[Auth] restore() - user already loaded, skipping");
			return;
		}
		if (restoreInFlight) {
			console.log("[Auth] restore() - restoration already in flight, waiting...");
			return await restoreInFlight;
		}
		// SSR : pas de localStorage ni de tokens — la restauration est côté client.
		if (typeof window === "undefined") {
			console.log("[Auth] restore() - SSR context, skipping");
			return;
		}
		const tokens = tokenStorage.get();
		if (!tokens) {
			console.log("[Auth] restore() - no tokens in storage, skipping");
			return;
		}

		console.log("[Auth] restore() - starting restoration...");
		restoreInFlight = (async () => {
			try {
				const refreshed = await refresh();
				console.log("[Auth] restore() - refresh result:", refreshed);
				if (refreshed) {
					const me = await authApi.me();
					console.log("[Auth] restore() - user loaded:", me.login);
					setUser(me);
				}
			} catch (error) {
				console.error("[Auth] restore() - error:", error);
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
	};

	// Construction du client API singleton, une seule fois.
	setApiClient(
		createApiClient({
			getAccessToken: () => tokenStorage.get()?.accessToken ?? null,
			refresh: () => session.refresh(),
			onSessionExpired: () => session.handleSessionExpired(),
		}),
	);

	return session;
}
