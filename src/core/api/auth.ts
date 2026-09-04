import { getApiClient } from "./client";
import type { components } from "./generated/schema";
import type {
	AuthLoginResponse,
	AuthMeResponse,
	AuthRefreshResponse,
} from "./types";

type LoginDto = components["schemas"]["LoginDto"];
type RefreshTokenDto = components["schemas"]["RefreshTokenDto"];
type LogoutDto = components["schemas"]["LogoutDto"];
type MotDePasseOublieDto = components["schemas"]["MotDePasseOublieDto"];
type ReinitialiserMotDePasseTokenDto =
	components["schemas"]["ReinitialiserMotDePasseTokenDto"];
type InscriptionDto = {
	nom: string;
	prenoms: string;
	tel_principal: string;
	login: string;
	mot_de_passe: string;
};

/**
 * Couche API d'authentification (JWT custom). Aucune logique de session ici —
 * uniquement les appels HTTP typés, dont les DTO de requête proviennent du
 * schéma généré (jamais dupliqués à la main, spec prompt-adapted.md §11/§43).
 */
export const authApi = {
	login(body: LoginDto): Promise<AuthLoginResponse> {
		return getApiClient().apiFetch("/api/v1/auth/login", {
			method: "POST",
			body: JSON.stringify(body),
		});
	},

	/** Rotation : le backend révoque le refresh utilisé et en émet un nouveau. */
	refresh(body: RefreshTokenDto): Promise<AuthRefreshResponse> {
		return getApiClient().apiFetch("/api/v1/auth/refresh", {
			method: "POST",
			body: JSON.stringify(body),
		});
	},

	/** Exige le bearer + le refresh token à révoquer. */
	logout(body: LogoutDto): Promise<unknown> {
		return getApiClient().apiFetch("/api/v1/auth/logout", {
			method: "POST",
			body: JSON.stringify(body),
		});
	},

	/** Utilisateur courant + permissions (chargées par le backend, pas le JWT). */
	me(): Promise<AuthMeResponse> {
		return getApiClient().apiFetch("/api/v1/auth/me");
	},

	/** Inscription (auto-signup, sans authentification préalable). */
	signup(body: InscriptionDto): Promise<AuthLoginResponse> {
		return getApiClient().apiFetch("/api/v1/auth/inscription", {
			method: "POST",
			body: JSON.stringify(body),
		});
	},

	/**
	 * Demande de réinitialisation (public, sans authentification). Envoie un
	 * email si le compte existe, est actif, et a un email enregistré (propre
	 * ou via le dossier client lié) — répond `{ envoye: true }` dans tous les
	 * autres cas gérés par un 400 (compte inconnu/inactif, pas d'email).
	 */
	motDePasseOublie(body: MotDePasseOublieDto): Promise<{ envoye: boolean }> {
		return getApiClient().apiFetch("/api/v1/auth/mot-de-passe-oublie", {
			method: "POST",
			body: JSON.stringify(body),
		});
	},

	/**
	 * Applique le nouveau mot de passe à partir du jeton reçu par email (public,
	 * sans authentification) — même jeton que le lien « définir mon mot de
	 * passe » envoyé à la création d'un compte résident. Révoque toutes les
	 * sessions ouvertes du compte au succès.
	 */
	reinitialiserMotDePasse(
		body: ReinitialiserMotDePasseTokenDto,
	): Promise<{ reinitialise: boolean }> {
		return getApiClient().apiFetch("/api/v1/auth/reinitialiser-mot-de-passe", {
			method: "POST",
			body: JSON.stringify(body),
		});
	},
};
