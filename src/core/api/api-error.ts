import type { ApiErrorEnvelope, ValidationErrorDetail } from "./types";

/** Codes d'erreur produit par le frontend lui-même (enveloppe backend absente). */
export const ApiErrorCode = {
	NETWORK_ERROR: "NETWORK_ERROR",
	TIMEOUT_ERROR: "TIMEOUT_ERROR",
} as const;

/**
 * Erreur normalisée de l'API. L'enveloppe réelle du backend
 * `{success, code, message, details, requestId, path, timestamp}` est
 * dépaquetée ici en un objet typé que l'UI peut mapper sur un `code`.
 */
export class ApiError extends Error {
	readonly status: number;
	readonly code: string;
	readonly details: unknown;
	readonly requestId?: string;
	readonly path?: string;

	constructor(init: {
		status: number;
		code: string;
		message: string;
		details?: unknown;
		requestId?: string;
		path?: string;
	}) {
		super(init.message);
		this.name = "ApiError";
		this.status = init.status;
		this.code = init.code;
		this.details = init.details;
		this.requestId = init.requestId;
		this.path = init.path;
	}
}

export function isApiError(error: unknown): error is ApiError {
	return error instanceof ApiError;
}

export function isValidationErrorDetail(
	value: unknown,
): value is ValidationErrorDetail {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Partial<ValidationErrorDetail>;
	return (
		typeof candidate.property === "string" && Array.isArray(candidate.messages)
	);
}

/** Normalise l'enveloppe backend (ou toute erreur) en `ApiError`. */
export function toApiError(error: unknown): ApiError {
	if (isApiError(error)) return error;
	return new ApiError({
		status: 0,
		code: ApiErrorCode.NETWORK_ERROR,
		message: error instanceof Error ? error.message : "Erreur inconnue",
	});
}

/**
 * Extrait les erreurs champ-par-champ d'une erreur `VALIDATION_ERROR`
 * (`details: [{property, messages}]`). À mapper sur les champs d'un formulaire.
 */
export function getFieldErrors(error: unknown): ValidationErrorDetail[] {
	if (!isApiError(error)) return [];
	if (!Array.isArray(error.details)) return [];
	return error.details.filter(isValidationErrorDetail);
}

/**
 * Construit un ApiError depuis un corps d'erreur HTTP quelconque.
 * Si le corps respecte l'enveloppe backend, ses champs sont conservés ;
 * sinon on retombe sur une valeur par défaut dérivée du statut.
 */
export function buildApiError(status: number, body: unknown): ApiError {
	const envelope = (body && typeof body === "object" ? body : {}) as Partial<
		Pick<
			ApiErrorEnvelope,
			"code" | "message" | "details" | "requestId" | "path"
		>
	>;
	return new ApiError({
		status,
		code: envelope.code ?? String(status),
		message: envelope.message ?? `Erreur HTTP ${status}`,
		details: envelope.details,
		requestId: envelope.requestId,
		path: envelope.path,
	});
}
