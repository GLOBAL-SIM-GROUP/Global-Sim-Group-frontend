/**
 * Stockage des tokens JWT.
 *
 * Choix par défaut (validé 2026-08-18) : **persistant** (`localStorage`) — la
 * session survit au rechargement, restaurée par `auth.restore()`. Trade-off :
 * un script injecté (XSS) pourrait lire les tokens persistants (cf.
 * docs/authentication.md). `createMemoryTokenStore` reste disponible derrière
 * la même interface `TokenStorage`.
 */
export interface StoredTokens {
	accessToken: string;
	/** Durée de vie de l'access token, en secondes. */
	accessExpiresIn: number;
	refreshToken: string;
	/** Durée de vie du refresh token, en secondes. */
	refreshExpiresIn: number;
}

export interface TokenStorage {
	get(): StoredTokens | null;
	set(tokens: StoredTokens): void;
	clear(): void;
}

/** Stockage en mémoire (défaut). */
export function createMemoryTokenStore(): TokenStorage {
	let tokens: StoredTokens | null = null;
	return {
		get: () => tokens,
		set: (next) => {
			tokens = next;
		},
		clear: () => {
			tokens = null;
		},
	};
}

/**
 * Stockage persistant via `localStorage`.
 *
 * ⚠️ Trade-off : tout code exécuté dans la page (notamment via XSS) peut lire
 * ces tokens. Préférez la mémoire sauf si la persistance de session est une
 * exigence produit explicite. Ne PAS utiliser pour des valeurs sensibles
 * autres que ce qui est strictement nécessaire au fonctionnement de la session.
 */
export function createLocalStorageTokenStore(
	storageKey = "sim.tokens",
): TokenStorage {
	return {
		get: () => {
			const raw =
				typeof localStorage === "undefined"
					? null
					: localStorage.getItem(storageKey);
			if (!raw) return null;
			try {
				return JSON.parse(raw) as StoredTokens;
			} catch {
				return null;
			}
		},
		set: (tokens) => {
			localStorage.setItem(storageKey, JSON.stringify(tokens));
		},
		clear: () => {
			localStorage.removeItem(storageKey);
		},
	};
}
