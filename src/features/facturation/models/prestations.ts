/**
 * Prestation facturable (module M7). Types hand-typed revalidés sur le backend
 * réel (GET /facturation/prestations). Clé primaire wire `id_prestation` → `id`.
 */
export interface Prestation {
	id: string;
	libelle: string;
	categorie: string | null;
	prix: string;
	description: string | null;
	id_activite: string | null;
	actif: boolean;
}

/** Filtres de la liste des prestations (URL + côté client). */
export interface PrestationFiltres {
	actif: string;
}

/** Filtre la liste : prestations actives uniquement si demandé. Fonction pure. */
export function filtrerPrestations(
	prestations: readonly Prestation[],
	filtres: PrestationFiltres,
): Prestation[] {
	return prestations.filter((prestation) => {
		if (filtres.actif === "actifs" && !prestation.actif) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PagePrestations {
	items: Prestation[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerPrestations(
	prestations: readonly Prestation[],
	page: number,
	pageSize: number,
): PagePrestations {
	const total = prestations.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = prestations.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
