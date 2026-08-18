/**
 * Bâtiment de la résidence (module M2.1).
 *
 * Le spec OpenAPI ne déclare aucun schéma de réponse (cf. docs/api.md) : ce
 * type est hand-typed et sera revalidé au smoke test réel. Les id bigint sont
 * transportés en string par le backend (comme `id_logement`).
 */
export interface Batiment {
	id: string;
	code: string;
	nom: string;
	adresse: string | null;
	actif: boolean;
}

/** Valeurs du filtre « Actif » (URL : `?actif=`). */
export type BatimentActifFiltre = "tous" | "actif" | "inactif";

/** Filtres de la liste des bâtiments (appliqués côté client). */
export interface BatimentFiltres {
	search: string;
	actif: BatimentActifFiltre;
}

/** Résultat de la pagination client. */
export interface PageBatiments {
	items: Batiment[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/**
 * Filtre la liste (recherche texte sur code/nom/adresse + statut). Fonction
 * pure, sans dépendance React — testable unitairement.
 */
export function filtrerBatiments(
	batiments: readonly Batiment[],
	filtres: BatimentFiltres,
): Batiment[] {
	const terme = filtres.search.trim().toLowerCase();
	return batiments.filter((batiment) => {
		if (filtres.actif === "actif" && !batiment.actif) return false;
		if (filtres.actif === "inactif" && batiment.actif) return false;
		if (!terme) return true;
		return [batiment.code, batiment.nom, batiment.adresse ?? ""].some(
			(valeur) => valeur.toLowerCase().includes(terme),
		);
	});
}

/**
 * Pagination client (le lister ne documente aucune pagination serveur).
 * Page bornée à [1, totalPages].
 */
export function paginerBatiments(
	batiments: readonly Batiment[],
	page: number,
	pageSize: number,
): PageBatiments {
	const total = batiments.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = batiments.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
