import { getApiClient } from "#/core/api";

/**
 * API du module Facturation — téléchargements de factures.
 */

/** Télécharge une facture en PDF. */
export function telechargerFacturePdf(idFacture: string): Promise<Blob> {
	return getApiClient().download(`/api/v1/facturation/factures/${idFacture}/pdf`);
}

/** Télécharge un ticket de caisse (58mm ou 80mm). */
export function telechargerTicketFacture(
	idFacture: string,
	largeur: 58 | 80 = 58,
): Promise<Blob> {
	return getApiClient().download(
		`/api/v1/facturation/factures/${idFacture}/ticket?largeur=${largeur}`,
	);
}
