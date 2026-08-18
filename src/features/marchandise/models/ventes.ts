/**
 * Vente du Market (module M3). Types hand-typed revalidés sur le backend réel
 * (GET /market/ventes, GET /market/ventes/{id}). Clé primaire wire `id_vente`
 * → `id`.
 */
export type VenteStatut = "EN_COURS" | "PAYEE" | "ANNULEE";

export interface Vente {
	id: string;
	id_client: string | null;
	date: string;
	remise: string;
	total: string;
	statut: VenteStatut;
	id_utilisateur: string | null;
}

/** Ligne d'une vente (GET /market/ventes/{id} → `lignes[]`). */
export interface LigneVente {
	id: string;
	id_vente: string;
	id_produit: string;
	quantite: string;
	prix_unitaire: string;
	remise_ligne: string;
	total_ligne: string;
}

/** Détail d'une vente : le GET par id embarque les lignes. */
export interface VenteDetail extends Vente {
	lignes: LigneVente[];
}

/** Vente enrichie pour la liste : nom du client résolu par la page. */
export interface VenteJoin extends Vente {
	clientNom: string;
}

/** Libellés français du statut de vente. */
export const VENTE_STATUT_LABELS: Record<VenteStatut, string> = {
	EN_COURS: "En cours",
	PAYEE: "Payée",
	ANNULEE: "Annulée",
};

/** Valeurs du filtre « Statut » (URL : `?statut=`). */
export type VenteStatutFiltre = "tous" | VenteStatut;

/** Filtres de l'historique des ventes (URL + côté client). */
export interface VenteFiltres {
	statut: VenteStatutFiltre;
	du: string;
	au: string;
}

/**
 * Filtre l'historique. Statut (exact) et période (jour de `date` `YYYY-MM-DD
 * HH:MM:SS`). Le filtre « client » est appliqué par la page sur le nom résolu.
 * Fonction pure et générique (préserve le type d'entrée, ex. `VenteJoin`).
 */
export function filtrerVentes<T extends Vente>(
	ventes: readonly T[],
	filtres: VenteFiltres,
): T[] {
	return ventes.filter((vente) => {
		if (filtres.statut !== "tous" && vente.statut !== filtres.statut) {
			return false;
		}
		const jour = vente.date.slice(0, 10);
		if (filtres.du && jour < filtres.du) return false;
		if (filtres.au && jour > filtres.au) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageVentes<T extends Vente = Vente> {
	items: T[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerVentes<T extends Vente>(
	ventes: readonly T[],
	page: number,
	pageSize: number,
): PageVentes<T> {
	const total = ventes.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = ventes.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
