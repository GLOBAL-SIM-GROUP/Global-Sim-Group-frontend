import { getApiClient } from "#/core/api";
import { getImprimanteThermique } from "#/lib/imprimante-thermique-store";
import { imprimerHtml, imprimerPdfBlob } from "#/lib/print-pdf";
import { imprimerTicketQZ } from "#/lib/qz-tray-client";

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
 * Imprime le ticket de caisse (58mm ou 80mm) d'une facture. Le backend
 * renvoie du HTML : si une imprimante QZ Tray est configurée sur ce poste
 * (`imprimante-thermique-store.ts`), on imprime directement dessus — la
 * largeur physique est alors imposée par QZ (niveau pilote), indépendamment
 * de la boîte d'impression du navigateur (voir `docs/impression.md`). Sinon,
 * ou si QZ Tray a échoué (agent fermé, imprimante débranchée…), repli
 * silencieux sur la boîte d'impression du navigateur — jamais d'échec dur
 * pour l'utilisateur.
 */
export async function printFactureTicket(
	factureId: string,
	largeur: 58 | 80 = 58,
): Promise<void> {
	const blob = await getApiClient().download(
		`/api/v1/facturation/factures/${factureId}/ticket?largeur=${largeur}`,
	);
	const html = await blob.text();

	const imprimanteQZ = getImprimanteThermique();
	if (imprimanteQZ) {
		try {
			await imprimerTicketQZ(html, largeur, imprimanteQZ);
			return;
		} catch (error) {
			console.error(
				"Impression QZ Tray indisponible, repli sur la boîte d'impression du navigateur",
				error,
			);
		}
	}
	imprimerHtml(html, largeur);
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
