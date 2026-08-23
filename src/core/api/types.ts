/**
 * Types de réponse écrits à la main.
 *
 * Le spec OpenAPI du backend (`https://dev.sim.strife-cyber.org/docs-json`)
 * ne déclare **aucun schéma de réponse** pour la quasi-totalité des opérations
 * (ni enveloppe d'erreur, ni noms de permissions, ni types brandés
 * BigIntStr/Money/DateStr). Ces types reproduisent les contrats réels décrits
 * dans `prompt-adapted.md` (§8, §20, §22) et le seeding backend, à revalider
 * contre `/api/v1/auth/login` et `/api/v1/auth/me` réels lors du smoke test.
 *
 * Conventions backend (à conserver telles quelles, voir docs/api.md) :
 * - noms de champs en snake_case (`mot_de_passe`, `id_utilisateur`) ;
 * - valeurs bigint/money/date **encodées en string** sur le réseau.
 */

/** Utilisateur réduit renvoyé par le backend (auth / me). */
export interface UtilisateurAuth {
	/** bigint, transporté en string. */
	id: string;
	login: string;
	role: string;
}

/** Réponse de `POST /auth/login` (prompt-adapted.md §8). */
export interface AuthLoginResponse {
	accessToken: string;
	/** Durée de vie de l'access token, en secondes. */
	accessExpiresIn: number;
	refreshToken: string;
	/** Durée de vie du refresh token, en secondes. */
	refreshExpiresIn: number;
	utilisateur: UtilisateurAuth;
}

/** Réponse de `POST /auth/refresh` (rotation) — même forme que login. */
export type AuthRefreshResponse = AuthLoginResponse;

/**
 * Réponse de `GET /auth/me` (prompt-adapted.md §8).
 * Le spec ne déclare aucun schéma de réponse pour `/api/v1/me`.
 */
export interface AuthMeResponse {
	/** bigint, transporté en string. */
	id: string;
	login: string;
	role: string;
	/** Permissions de l'utilisateur, triées — ex. `"RESIDENCE.VOIR"`. */
	permissions: string[];
}

/** Détail d'une erreur de validation champ-par-champ (formulaires). */
export interface ValidationErrorDetail {
	property: string;
	messages: string[];
}

/**
 * Enveloppe d'erreur réelle du backend (prompt-adapted.md §20).
 * Le spec OpenAPI ne la déclare pas ; elle est typée ici à partir du contrat
 * documenté. Le code HTTP est mappé par le backend : 23505→409, 23503→422,
 * 22P02/23514→400, validation→400 (`VALIDATION_ERROR`), auth→401.
 */
export interface ApiErrorEnvelope {
	success: false;
	code: string;
	message: string;
	details?: unknown;
	requestId?: string;
	path?: string;
	timestamp?: string;
}

/** État de santé renvoyé par `/api/v1/health/live` et `/api/v1/health/ready`. */
export interface HealthStatus {
	status: "ok" | "error";
}

export interface HealthReadyStatus extends HealthStatus {
	database: "up" | "down";
	redis: "up" | "down";
	error?: Record<string, unknown>;
	details?: Record<string, unknown>;
}
