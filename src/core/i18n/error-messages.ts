import { ApiErrorCode } from "#/core/api/api-error";
import * as m from "#/paraglide/messages";

type MessageFactory = () => string;

/**
 * Codes d'enveloppe backend (`ApiError.code`) → message Paraglide.
 *
 * Le backend renvoie ses messages en français ; l'UI affiche toujours la
 * traduction courante. Les codes inconnus renvoient `null` : l'appelant
 * décide du message de repli (générique, ou `error_http_unknown`).
 */
const CODE_TO_MESSAGE: Record<string, MessageFactory> = {
	VALIDATION_ERROR: () => m.error_code_VALIDATION_ERROR(),
	UNAUTHORIZED: () => m.error_code_UNAUTHORIZED(),
	[ApiErrorCode.NETWORK_ERROR]: () => m.error_code_NETWORK_ERROR(),
};

export function getErrorMessageForCode(code: string): string | null {
	const message = CODE_TO_MESSAGE[code];
	return message ? message() : null;
}
