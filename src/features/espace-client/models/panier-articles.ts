/**
 * Cœur générique d'une ligne de panier (plat, produit…) — état 100% frontend
 * (pas de commande côté backend pour un compte CLIENT à ce jour, cf. mémoire
 * `extension-clients-externes`). Copie les champs de l'article au moment de
 * l'ajout plutôt qu'une simple référence d'id : le panier reste cohérent même
 * si l'article change (prix, nom) ou disparaît du catalogue pendant qu'il y
 * est.
 */
/**
 * Clés localStorage des paniers par service — centralisées pour que la page
 * Panier récapitule restaurant et boutique sans dupliquer les chaînes.
 */
export const CLE_PANIER_RESTAURANT = "espace-client.panier.restaurant";
export const CLE_PANIER_BOUTIQUE = "espace-client.panier.boutique";

/**
 * Événement `window` émis à chaque écriture d'un panier : l'événement
 * `storage` natif ne se déclenche pas dans l'onglet qui modifie
 * `localStorage`, d'où ce signal maison pour le badge de la navbar.
 */
export const EVENEMENT_PANIER_MAJ = "espace-client:panier-maj";

export interface LigneArticlePanier {
	id: string;
	nom: string;
	prix: string;
	imageUrl: string | null;
	quantite: number;
}

/** Champs qu'un article (plat, produit…) doit fournir pour rejoindre un panier. */
export interface ArticleSelectionnable {
	id: string;
	nom: string;
	prix: string;
}

export function ligneDepuisArticle(
	article: ArticleSelectionnable,
	imageUrl: string | null,
): LigneArticlePanier {
	return {
		id: article.id,
		nom: article.nom,
		prix: article.prix,
		imageUrl,
		quantite: 1,
	};
}

export function totalPanier(lignes: readonly LigneArticlePanier[]): number {
	return lignes.reduce(
		(somme, ligne) => somme + Number(ligne.prix) * ligne.quantite,
		0,
	);
}

export function nombreArticlesPanier(
	lignes: readonly LigneArticlePanier[],
): number {
	return lignes.reduce((somme, ligne) => somme + ligne.quantite, 0);
}
