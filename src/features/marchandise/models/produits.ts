/**
 * Produit du Market (module M3). Types hand-typed revalidés sur le backend réel
 * (GET /market/produits). Clé primaire wire `id_produit` → `id` ; les FK
 * `id_categorie_produit`/api/v1/`id_fournisseur` restent en snake_case.
 */
export interface Produit {
	id: string;
	reference: string;
	nom: string;
	id_categorie_produit: string | null;
	prix_achat: string;
	prix_vente: string;
	quantite_stock: string;
	seuil_alerte: string;
	id_fournisseur: string | null;
	date_entree: string | null;
	actif: boolean;
	image_url?: string | null;
}

/** Catégorie de produit (GET /market/categories-produits). */
export interface CategorieProduit {
	id: string;
	libelle: string;
}

/** Fournisseur (GET /market/fournisseurs). */
export interface Fournisseur {
	id: string;
	nom: string;
	contact: string | null;
	telephone: string | null;
	email: string | null;
	adresse: string | null;
}

/** Valeurs du filtre « Alerte » (stock < seuil). */
export type ProduitAlerteFiltre = "tous" | "alerte";

/** Valeurs du filtre « Épuisés » (stock ≤ 0). */
export type ProduitEpuisesFiltre = "tous" | "epuises";

/** Filtres du catalogue produits (URL + côté client). */
export interface ProduitFiltres {
	categorie: string;
	fournisseur: string;
	alerte: ProduitAlerteFiltre;
	epuises: ProduitEpuisesFiltre;
}

/** Stock en alerte : quantité sous le seuil (strictement). */
export function estEnAlerte(produit: Produit): boolean {
	return Number(produit.quantite_stock) < Number(produit.seuil_alerte);
}

/** Stock épuisé : quantité nulle ou négative. */
export function estEpuise(produit: Produit): boolean {
	return Number(produit.quantite_stock) <= 0;
}

/**
 * Filtre le catalogue. Catégorie/fournisseur par id (selects), alertes et
 * épuisés en plus du filtrage de base. Fonction pure, sans dépendance React.
 */
export function filtrerProduits(
	produits: readonly Produit[],
	filtres: ProduitFiltres,
): Produit[] {
	return produits.filter((produit) => {
		if (
			filtres.categorie !== "tous" &&
			produit.id_categorie_produit !== filtres.categorie
		) {
			return false;
		}
		if (
			filtres.fournisseur !== "tous" &&
			produit.id_fournisseur !== filtres.fournisseur
		) {
			return false;
		}
		if (filtres.alerte === "alerte" && !estEnAlerte(produit)) return false;
		if (filtres.epuises === "epuises" && !estEpuise(produit)) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageProduits {
	items: Produit[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerProduits(
	produits: readonly Produit[],
	page: number,
	pageSize: number,
): PageProduits {
	const total = produits.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = produits.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
