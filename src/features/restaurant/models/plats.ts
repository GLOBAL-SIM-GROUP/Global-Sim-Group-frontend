/**
 * Plat / boisson du menu (module M5). Types hand-typed revalidés sur le backend
 * réel (GET /restaurant/plats). Clé primaire wire `id_plat` → `id` ; la FK
 * `id_categorie_plat` reste en snake_case.
 */
export interface Plat {
	id: string;
	nom: string;
	id_categorie_plat: string | null;
	prix: string;
	disponible: boolean;
	description: string | null;
}

/** Catégorie de plat (GET /restaurant/categories). */
export interface CategoriePlat {
	id: string;
	libelle: string;
}

/** Filtres de la carte des plats (URL + côté client). */
export interface PlatFiltres {
	categorie: string;
	dispo: string;
}

/** Filtre la carte : catégorie (par id) et disponibilité. Fonction pure. */
export function filtrerPlats(
	plats: readonly Plat[],
	filtres: PlatFiltres,
): Plat[] {
	return plats.filter((plat) => {
		if (
			filtres.categorie !== "tous" &&
			plat.id_categorie_plat !== filtres.categorie
		) {
			return false;
		}
		if (filtres.dispo === "disponibles" && !plat.disponible) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PagePlats {
	items: Plat[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerPlats(
	plats: readonly Plat[],
	page: number,
	pageSize: number,
): PagePlats {
	const total = plats.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = plats.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
