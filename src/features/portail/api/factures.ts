import { getApiClient } from "#/core/api";
import type { Facture } from "#/features/facturation/models/factures";

/**
 * Façade « Mes factures » du client connecté (GET /facturation/portail/*) —
 * couvre tous les services (restaurant, boutique, pressing, salle de fête,
 * abonnement, séjour, résidence) : facture PDF, reçu PDF des paiements
 * enregistrés et ticket de caisse HTML 58/80mm.
 * Clé primaire wire `id_facture` → `id`.
 */
type FactureWire = Omit<Facture, "id"> & { id_facture: string };

const toFacture = ({ id_facture: id, ...reste }: FactureWire): Facture => ({
	id,
	...reste,
});

/** Filtres serveur de GET /facturation/portail/factures. */
export interface MesFacturesFiltres {
	statut?: string;
	source_type?: string;
	numero?: string;
	du?: string;
	au?: string;
}

/** Liste les factures du client connecté (hors annulées). */
export function getMesFactures(
	filtres?: MesFacturesFiltres,
): Promise<Facture[]> {
	const params = new URLSearchParams();
	if (filtres?.statut) params.append("statut", filtres.statut);
	if (filtres?.source_type) params.append("source_type", filtres.source_type);
	if (filtres?.numero) params.append("numero", filtres.numero);
	if (filtres?.du) params.append("du", filtres.du);
	if (filtres?.au) params.append("au", filtres.au);
	const query = params.toString();
	return getApiClient()
		.apiFetch<FactureWire[]>(
			`/api/v1/facturation/portail/factures${query ? `?${query}` : ""}`,
		)
		.then((factures) => factures.map(toFacture));
}

/** PDF de la facture — document généré côté backend. */
export function telechargerMaFacturePdf(id: string): Promise<Blob> {
	return getApiClient().download(
		`/api/v1/facturation/portail/factures/${id}/pdf`,
	);
}

/**
 * PDF du reçu des paiements enregistrés sur la facture — 409 si la facture
 * n'a encore aucun encaissement.
 */
export function telechargerMonRecuFacturePdf(id: string): Promise<Blob> {
	return getApiClient().download(
		`/api/v1/facturation/portail/factures/${id}/recu`,
	);
}

/** HTML du ticket de caisse 58/80mm — à imprimer via `imprimerHtml`. */
export function getMonTicketFactureHtml(
	id: string,
	largeur: 58 | 80 = 80,
): Promise<string> {
	return getApiClient()
		.download(
			`/api/v1/facturation/portail/factures/${id}/ticket?largeur=${largeur}`,
		)
		.then((blob) => blob.text());
}
