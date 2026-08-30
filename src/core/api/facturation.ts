import { getApiClient } from "#/core/api";
import { imprimerPdfBlob } from "#/lib/print-pdf";

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

export type FactureStatut = "PAYEE" | "PARTIELLE" | "IMPAYEE" | "ANNULEE";

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

/** Clé primaire wire du backend (`id_facture`) → remappée en `id`. */
type FactureWire = Omit<Facture, "id"> & { id_facture: string };

const toFacture = ({ id_facture: id, ...reste }: FactureWire): Facture => ({
	id,
	...reste,
});

interface ListFacturesParams {
	source_type?: FactureSourceType;
	statut?: FactureStatut;
	id_client?: string;
	montant_total?: string;
	recherche?: string;
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
		const factures = await getApiClient().apiFetch<FactureWire[]>(
			`/api/v1/facturation/factures?${queryParams.toString()}`,
		);
		return factures.length > 0 ? toFacture(factures[0]) : null;
	} catch {
		return null;
	}
}

/**
 * Imprime le PDF d'une facture (personnel/admin — pas d'étape de
 * téléchargement intermédiaire, contrairement au portail résident).
 */
export async function printFacturePdf(factureId: string): Promise<void> {
	const blob = await getApiClient().download(
		`/api/v1/facturation/factures/${factureId}/pdf`,
	);
	imprimerPdfBlob(blob);
}

/**
 * Imprime le ticket de caisse (58mm ou 80mm) d'une facture.
 */
export async function printFactureTicket(
	factureId: string,
	largeur: 58 | 80 = 58,
): Promise<void> {
	const blob = await getApiClient().download(
		`/api/v1/facturation/factures/${factureId}/ticket?largeur=${largeur}`,
	);
	imprimerPdfBlob(blob);
}

/**
 * Récupère le détail d'une facture.
 */
export async function getFacture(id: string): Promise<Facture> {
	return getApiClient()
		.apiFetch<FactureWire>(`/api/v1/facturation/factures/${id}`)
		.then(toFacture);
}

/**
 * Liste les factures avec filtres.
 */
export async function listFactures(
	params?: ListFacturesParams,
): Promise<Facture[]> {
	const queryParams = new URLSearchParams();

	if (params?.source_type) {
		queryParams.append("source_type", params.source_type);
	}
	if (params?.statut) {
		queryParams.append("statut", params.statut);
	}
	if (params?.id_client) {
		queryParams.append("id_client", params.id_client);
	}
	if (params?.recherche) {
		queryParams.append("recherche", params.recherche);
	}
	if (params?.du) {
		queryParams.append("du", params.du);
	}
	if (params?.au) {
		queryParams.append("au", params.au);
	}
	if (params?.limit) {
		queryParams.append("limit", params.limit.toString());
	}
	if (params?.offset) {
		queryParams.append("offset", params.offset.toString());
	}

	return getApiClient()
		.apiFetch<FactureWire[]>(
			`/api/v1/facturation/factures?${queryParams.toString()}`,
		)
		.then((data) => data.map(toFacture));
}
