/**
 * Tri alphabétique français (insensible à la casse et aux accents) pour les
 * référentiels affichés dans les selects et catalogues — catégories,
 * fournisseurs, moyens de paiement, etc. Appliqué dans la couche `api` pour
 * que tous les consommateurs héritent du même ordre.
 */
export function trierAlpha<T>(
	items: readonly T[],
	getLibelle: (item: T) => string,
): T[] {
	return [...items].sort((a, b) =>
		getLibelle(a).localeCompare(getLibelle(b), "fr", { sensitivity: "base" }),
	);
}
