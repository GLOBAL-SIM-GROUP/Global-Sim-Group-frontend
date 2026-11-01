import { getApiClient } from "./client";

/** Taille de page demandée quand on récupère la totalité d'un lister. */
const TAILLE_PAGE = 100;

/**
 * Récupère TOUTES les pages d'un lister backend paginé (`limit`/`offset`).
 *
 * Le backend plafonne la réponse à 50 entrées quand aucun `limit` n'est
 * envoyé — vérifié en direct sur la prod (`GET /market/produits` : 50 items
 * sans paramètre, 108 avec `limit=200`). Sans cette boucle, les listes
 * « chargées en entier » se tronquent silencieusement à 50 entrées.
 *
 * La réponse étant un tableau nu sans total, on s'arrête à la première page
 * courte (`page.length < TAILLE_PAGE`). À n'appliquer qu'aux endpoints
 * documentés avec `limit`/`offset` dans le spec — les autres ignorent le
 * paramètre (inoffensif mais inutile).
 */
export async function fetchToutesPages<T>(chemin: string): Promise<T[]> {
	const client = getApiClient();
	const items: T[] = [];
	const separateur = chemin.includes("?") ? "&" : "?";
	let offset = 0;
	for (;;) {
		const page = await client.apiFetch<T[]>(
			`${chemin}${separateur}limit=${TAILLE_PAGE}&offset=${offset}`,
		);
		items.push(...page);
		if (page.length < TAILLE_PAGE) return items;
		offset += TAILLE_PAGE;
	}
}
