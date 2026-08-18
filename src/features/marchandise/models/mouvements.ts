/**
 * Mouvement de stock du Market (module M3). Types hand-typed revalidés sur le
 * backend réel (GET /market/stock/historique). Les lignes d'historique n'ont
 * PAS d'id (référence + nom du produit).
 */
export type MouvementType = "ENTREE" | "SORTIE" | "AJUSTEMENT";

export interface Mouvement {
	reference: string;
	nom: string;
	date: string;
	type: MouvementType;
	quantite_mouvement: string;
	delta: string;
	stock_resultant: string;
}

/** Libellés français du type de mouvement. */
export const MOUVEMENT_TYPE_LABELS: Record<MouvementType, string> = {
	ENTREE: "Entrée",
	SORTIE: "Sortie",
	AJUSTEMENT: "Ajustement",
};

/** Valeurs du filtre « Type » (URL : `?type=`). */
export type MouvementTypeFiltre = "tous" | MouvementType;

/** Filtres des mouvements de stock (URL + côté client). */
export interface MouvementFiltres {
	type: MouvementTypeFiltre;
	du: string;
	au: string;
	produit: string;
}

/**
 * Filtre l'historique. Type (exact), période (jour de `date`), texte
 * « produit » (référence ou nom). Fonction pure, sans dépendance React.
 */
export function filtrerMouvements(
	mouvements: readonly Mouvement[],
	filtres: MouvementFiltres,
): Mouvement[] {
	return mouvements.filter((mouvement) => {
		if (filtres.type !== "tous" && mouvement.type !== filtres.type) {
			return false;
		}
		const jour = mouvement.date.slice(0, 10);
		if (filtres.du && jour < filtres.du) return false;
		if (filtres.au && jour > filtres.au) return false;
		if (
			filtres.produit &&
			!`${mouvement.reference} ${mouvement.nom}`
				.toLowerCase()
				.includes(filtres.produit.toLowerCase())
		) {
			return false;
		}
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageMouvements {
	items: Mouvement[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerMouvements(
	mouvements: readonly Mouvement[],
	page: number,
	pageSize: number,
): PageMouvements {
	const total = mouvements.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = mouvements.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
