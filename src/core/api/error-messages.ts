import {
	ApiErrorCode,
	CaisseErrorCode,
	getResteAPayerDetail,
	PaiementErrorCode,
	toApiError,
} from "./api-error";

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
	[CaisseErrorCode.FERMEE]:
		"La caisse est fermée — ouvrez-la avant d'enregistrer une opération.",
	[CaisseErrorCode.REQUISE]:
		"Sélectionnez la caisse dans laquelle enregistrer l'opération.",
	[CaisseErrorCode.NON_AUTORISEE]:
		"Cette caisse n'est pas dans votre périmètre d'encaissement.",
	[CaisseErrorCode.INTROUVABLE]:
		"La caisse choisie n'existe plus — rechargez le formulaire.",
	[PaiementErrorCode.MONTANT_INVALIDE]:
		"Le montant doit être un nombre strictement positif.",
	[PaiementErrorCode.MONTANT_DEPASSE_RESTE]: "Le montant dépasse le reste dû.",
	[PaiementErrorCode.SOLDE_INCOMPLET]:
		"Le règlement final exige le reste dû exact.",
	[PaiementErrorCode.MONTANT_TOTAL_ABSENT]:
		"L'opération n'est pas encore tarifée — chiffrez-la d'abord.",
	[PaiementErrorCode.MOYEN_PAIEMENT_REQUIS]:
		"Sélectionnez un moyen de paiement.",
	[PaiementErrorCode.MOYEN_PAIEMENT_SUPERFLU]:
		"Aucun encaissement à enregistrer — aucun moyen de paiement ne s'applique.",
	[PaiementErrorCode.STATUT_INCOMPATIBLE]:
		"Le statut de cette opération ne permet plus de paiement.",
	[PaiementErrorCode.FACTURE_INTROUVABLE]:
		"Facture introuvable — rechargez la fiche.",
	[PaiementErrorCode.REMISE_INVALIDE]: "La remise est hors limites.",
};

export function getErrorMessageForCode(code: string): string | null {
	return CODE_TO_MESSAGE[code] ?? null;
}

/**
 * Message à afficher dans un formulaire d'encaissement/décaissement :
 * le `code` de l'enveloppe prime (contrat stable), `details.reste_a_payer`
 * enrichit `MONTANT_DEPASSE_RESTE`/`SOLDE_INCOMPLET`, puis repli sur le
 * message serveur.
 */
export function messageErreurPaiement(error: unknown): string {
	const apiError = toApiError(error);
	const base = getErrorMessageForCode(apiError.code);
	const reste = getResteAPayerDetail(apiError);
	if (
		reste &&
		(apiError.code === PaiementErrorCode.MONTANT_DEPASSE_RESTE ||
			apiError.code === PaiementErrorCode.SOLDE_INCOMPLET)
	) {
		const resteFormate = `${Number(reste).toLocaleString("fr-FR")} FCFA`;
		return `${base ?? "Le montant est incorrect."} Reste dû : ${resteFormate}.`;
	}
	return base ?? (apiError.message || "Une erreur est survenue.");
}
