/**
 * Facture et facturation ponctuelle (module M7). Types hand-typed revalidés sur
 * le backend réel (GET /facturation/factures et /facturation/factures/{id}).
 * Clés primaires wire `id_facture`/`id_ligne` → `id`.
 */
export type FactureStatut = "PAYEE" | "PARTIELLE" | "IMPAYEE";

/** Libellés français du statut de facture. */
export const FACTURE_STATUT_LABELS: Record<FactureStatut, string> = {
	PAYEE: "Payée",
	PARTIELLE: "Partielle",
	IMPAYEE: "Impayée",
};

/** Classes de badge (fond/texte) par statut de facture. */
export const FACTURE_STATUT_BADGE: Record<FactureStatut, string> = {
	PAYEE: "bg-[#27AE60] text-white",
	PARTIELLE: "bg-[#E67E22] text-white",
	IMPAYEE: "bg-[#E74C3C] text-white",
};

/** Libellés français des sources de facture (libre : nouveau type = valeur brute). */
export const FACTURE_SOURCE_LABELS: Record<string, string> = {
	COMMANDE_RESTAURANT: "Commande restaurant",
	COMMANDE_PRESSING: "Commande pressing",
	VENTE: "Vente",
	SEJOUR: "Séjour",
	PRESTATION: "Prestation",
	RESERVATION_FETE: "Réservation salle",
	CHARGE: "Charge",
};

/** Ligne d'une facture (wire `id_ligne` → `id`). */
export interface LigneFacture {
	id: string;
	id_facture: string;
	libelle: string;
	quantite: number;
	prix_unitaire: string;
	total: string;
}

/** Facture (lister et détail sans les lignes). */
export interface Facture {
	id: string;
	numero: string;
	date: string;
	id_client: string | null;
	id_activite: string | null;
	remise: string | null;
	montant_total: string;
	montant_paye: string;
	reste: string;
	statut: FactureStatut;
	source_type: string | null;
	source_id: string | null;
}

/** Détail d'une facture : facture + lignes. */
export interface FactureDetail extends Facture {
	lignes: LigneFacture[];
}

/**
 * Recherche texte client (numéro, source, nom du client) — le backend ignore le
 * param `recherche` du lister. `clients` : map id_client → nom complet.
 * Fonction pure — testable.
 */
export function rechercherFactures(
	factures: readonly Facture[],
	clients: ReadonlyMap<string, string>,
	terme: string,
): Facture[] {
	const termeBruite = terme.trim().toLowerCase();
	if (!termeBruite) return [...factures];
	return factures.filter((facture) => {
		if (facture.numero.toLowerCase().includes(termeBruite)) return true;
		if (facture.source_type?.toLowerCase().includes(termeBruite)) return true;
		const nomClient = facture.id_client
			? clients.get(facture.id_client)
			: undefined;
		return nomClient ? nomClient.toLowerCase().includes(termeBruite) : false;
	});
}

/** Filtres de la liste des factures (côté client). */
export interface FactureFiltres {
	statut: string;
	source: string;
}

/** Filtre la liste : statut et source de facture. Fonction pure. */
export function filtrerFactures(
	factures: readonly Facture[],
	filtres: FactureFiltres,
): Facture[] {
	return factures.filter((facture) => {
		if (filtres.statut !== "tous" && facture.statut !== filtres.statut) {
			return false;
		}
		if (filtres.source !== "tous" && facture.source_type !== filtres.source) {
			return false;
		}
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageFactures {
	items: Facture[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerFactures(
	factures: readonly Facture[],
	page: number,
	pageSize: number,
): PageFactures {
	const total = factures.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = factures.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
