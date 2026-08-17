/**
 * Frontière d'authentification du frontend.
 *
 * Les features n'appellent jamais `fetch('/auth/*')` directement : tout passe
 * par `createAuthSession` → `authApi` (via `core/api`). Le stockage des tokens
 * est injectable (`TokenStorage`) — défaut : mémoire.
 */
export { AuthProvider, useAuth } from "./auth-context";
export { requireAuth, requirePermissions } from "./guards";
export { useCan, useCurrentUser, usePermissions } from "./hooks";
export {
	type AuthSession,
	type AuthSessionSnapshot,
	createAuthSession,
} from "./session";
export {
	createLocalStorageTokenStore,
	createMemoryTokenStore,
	type StoredTokens,
	type TokenStorage,
} from "./token-store";
