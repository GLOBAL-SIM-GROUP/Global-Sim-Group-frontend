import { getApiClient } from "#/core/api";

export type FactureSourceType =
	| "VENTE"
	| "COMMANDE_PRESSING"
	| "COMMANDE_RESTAURANT"
	| "SEJOUR"
	| "CHARGE"
	| "LOCATION"
	| "RESERVATION_FETE"
	| "PRESTATION"
	| "AUTRE";

export type FactureStatut = "PAYEE" | "PARTIELLE" | "IMPAYEE" | "ANNULEA";

export interface Facture {
	id: string;
	numero: string;
	libelle: string;
	montant_total: string;
	statut: FactureStatut;
	source_type: FactureSourceType;
	id_client: string;
	date_emission: string;
}

interface ListFacturesParams {
	source_type?: FactureSourceType;
	statut?: FactureStatut;
	id_client?: string;
	montant_total?: string;
	limit?: number;
	offset?: number;
	du?: string;
	au?: string;
}

/**
 * Recherche une facture par source_type, client et montant.
 * Retourne la première facture PAYEE trouvée.
 */
export async function findFacture(
	sourceType: FactureSourceType,
	idClient: string,
	montantTotal?: string,
): Promise<Facture | null> {
	const queryParams = new URLSearchParams();
	queryParams.append("source_type", sourceType);
	queryParams.append("statut", "PAYEE");
	queryParams.append("id_client", idClient);
	if (montantTotal) {
		queryParams.append("montant_total", montantTotal);
	}
	queryParams.append("limit", "10");

	try {
		const factures = await getApiClient().apiFetch<Facture[]>(
			`/api/v1/facturation/factures?${queryParams.toString()}`,
		);
		return factures.length > 0 ? factures[0] : null;
	} catch {
		return null;
	}
}

/**
 * Télécharge le PDF d'une facture.
 */
export async function downloadFacturePdf(factureId: string): Promise<void> {
	const blob = await getApiClient().download(
		`/api/v1/facturation/factures/${factureId}/pdf`,
	);

	const downloadUrl = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = downloadUrl;
	link.download = `facture-${factureId}.pdf`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(downloadUrl);
}

/**
 * Récupère le détail d'une facture.
 */
export async function getFacture(id: string): Promise<Facture> {
	return getApiClient().apiFetch<Facture>(
		`/api/v1/facturation/factures/${id}`,
	);
}
