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

/** Codes `CAISSE_*` stables renvoyés par les endpoints d'encaissement/décaissement. */
export const CaisseErrorCode = {
	/** Caisse résolue sans période ouverte (400). */
	FERMEE: "CAISSE_FERMEE",
	/** `id_caisse` absent alors qu'un choix est requis, ou aucune caisse accessible (400). */
	REQUISE: "CAISSE_REQUISE",
	/** `id_caisse` hors du scope accessible de l'appelant (403). */
	NON_AUTORISEE: "CAISSE_NON_AUTORISEE",
	/** `id_caisse` soumis inexistant (400 — formulaire potentiellement périmé). */
	INTROUVABLE: "CAISSE_INTROUVABLE",
} as const;

/**
 * `true` si l'erreur signifie « caisse fermée » — code d'enveloppe
 * `CAISSE_FERMEE` (400), contrat stable depuis les commits backend
 * `b1f58ce`/`129c27d` (plus de matching sur le message).
 */
export function isCaisseFermeeError(error: unknown): boolean {
	return isApiError(error) && error.code === CaisseErrorCode.FERMEE;
}

/**
 * `true` si l'erreur signifie qu'aucune caisse n'a pu être résolue —
 * choix absent avec plusieurs options, ou aucune caisse accessible
 * (`CAISSE_REQUISE`, 400). Erreur champ sur le sélecteur de caisse.
 */
export function isCaisseRequiseError(error: unknown): boolean {
	return isApiError(error) && error.code === CaisseErrorCode.REQUISE;
}

/**
 * `true` si la caisse soumise sort du scope accessible (`CAISSE_NON_AUTORISEE`,
 * 403) — l'appelant doit refetch `caisses/accessibles` (scope périmé).
 */
export function isCaisseNonAutoriseeError(error: unknown): boolean {
	return isApiError(error) && error.code === CaisseErrorCode.NON_AUTORISEE;
}

/**
 * `true` si la caisse soumise n'existe plus (`CAISSE_INTROUVABLE`, 400 —
 * formulaire périmé) — l'appelant doit refetch `caisses/accessibles`.
 */
export function isCaisseIntrouvableError(error: unknown): boolean {
	return isApiError(error) && error.code === CaisseErrorCode.INTROUVABLE;
}

/**
 * `true` pour toute erreur `CAISSE_*` — à vérifier en dernier recours dans
 * les `catch` de formulaires de mouvement avant l'erreur générique.
 */
export function isCaisseError(error: unknown): boolean {
	return (
		isApiError(error) &&
		(Object.values(CaisseErrorCode) as string[]).includes(error.code)
	);
}

/**
 * Codes d'erreur métier des endpoints d'encaissement/décaissement
 * (backend `b063105`/`635dd7d`) — le contrat stable est le `code`, jamais
 * le message. `MONTANT_DEPASSE_RESTE`/`SOLDE_INCOMPLET` portent
 * `details.reste_a_payer` (string) pour le message champ.
 */
export const PaiementErrorCode = {
	/** Montant ≤ 0 ou non numérique (400). */
	MONTANT_INVALIDE: "MONTANT_INVALIDE",
	/** Montant > reste dû serveur — `details.reste_a_payer` dispo (400). */
	MONTANT_DEPASSE_RESTE: "MONTANT_DEPASSE_RESTE",
	/** Solde final ≠ reste exact sur un endpoint « solde » (400). */
	SOLDE_INCOMPLET: "SOLDE_INCOMPLET",
	/** Entité non tarifée (`montant_total: null`) — pas de paiement possible (400). */
	MONTANT_TOTAL_ABSENT: "MONTANT_TOTAL_ABSENT",
	/** `id_moyen` absent alors qu'un montant > 0 est à encaisser (400). */
	MOYEN_PAIEMENT_REQUIS: "MOYEN_PAIEMENT_REQUIS",
	/** `id_moyen` envoyé alors que rien n'est à encaisser (400). */
	MOYEN_PAIEMENT_SUPERFLU: "MOYEN_PAIEMENT_SUPERFLU",
	/** Paiement sur un statut terminal/interdit (409). */
	STATUT_INCOMPATIBLE: "STATUT_INCOMPATIBLE",
	/** Facture ciblée inexistante — formulaire périmé (404). */
	FACTURE_INTROUVABLE: "FACTURE_INTROUVABLE",
	/** Remise hors bornes (formulaire de facturation, 400). */
	REMISE_INVALIDE: "REMISE_INVALIDE",
} as const;

/**
 * `true` si l'erreur est un refus métier `MONTANT_*`/`SOLDE_INCOMPLET` —
 * erreur à rattacher au champ montant quand il existe.
 */
export function isMontantError(error: unknown): boolean {
	return (
		isApiError(error) &&
		(
			[
				PaiementErrorCode.MONTANT_INVALIDE,
				PaiementErrorCode.MONTANT_DEPASSE_RESTE,
				PaiementErrorCode.SOLDE_INCOMPLET,
				PaiementErrorCode.MONTANT_TOTAL_ABSENT,
			] as string[]
		).includes(error.code)
	);
}

/** `true` pour les codes `id_moyen` conditionnels (requis/superflu). */
export function isMoyenPaiementError(error: unknown): boolean {
	return (
		isApiError(error) &&
		(
			[
				PaiementErrorCode.MOYEN_PAIEMENT_REQUIS,
				PaiementErrorCode.MOYEN_PAIEMENT_SUPERFLU,
			] as string[]
		).includes(error.code)
	);
}

/** `true` si le statut de l'entité interdit le paiement (409 terminal). */
export function isStatutIncompatibleError(error: unknown): boolean {
	return (
		isApiError(error) && error.code === PaiementErrorCode.STATUT_INCOMPATIBLE
	);
}

/**
 * Extrait le `reste_a_payer` porté par `details` d'une erreur
 * `MONTANT_DEPASSE_RESTE`/`SOLDE_INCOMPLET` — `null` si absent.
 */
export function getResteAPayerDetail(error: unknown): string | null {
	if (!isApiError(error)) return null;
	const details = error.details;
	if (!details || typeof details !== "object") return null;
	const reste = (details as Record<string, unknown>).reste_a_payer;
	return typeof reste === "string" ? reste : null;
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
