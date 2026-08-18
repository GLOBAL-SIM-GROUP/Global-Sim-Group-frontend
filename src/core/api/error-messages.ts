import { ApiErrorCode } from "./api-error";

/**
 * Codes d'enveloppe backend (`ApiError.code`) → message français.
 *
 * L'UI est en français uniquement : le mapping est en dur ici. Les codes
 * inconnus renvoient `null` : l'appelant décide du message de repli
 * (générique).
 */
const CODE_TO_MESSAGE: Record<string, string> = {
	VALIDATION_ERROR: "La validation a échoué.",
	UNAUTHORIZED: "Session expirée, veuillez vous reconnecter.",
	[ApiErrorCode.NETWORK_ERROR]: "Erreur réseau.",
};

export function getErrorMessageForCode(code: string): string | null {
	return CODE_TO_MESSAGE[code] ?? null;
}
