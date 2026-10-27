/**
 * Statistiques des ventes du Market (module M3). Types hand-typed revalidés
 * sur le backend réel (GET /market/rapports/ventes).
 */
export interface RapportVentes {
	periode: { du: string | null; au: string | null };
	nb_ventes: string;
	ca_total: string;
	marge_totale: string;
	par_type: { statut: string; nb_ventes: string; ca: string }[];
	top_produits: {
		libelle: string;
		quantite: string;
		ca: string;
		marge: string;
	}[];
}

/** Produit en alerte stock (GET /market/stock/alerte). */
export interface AlerteStock {
	reference: string;
	nom: string;
	quantite_stock: string;
	seuil_alerte: string;
	niveau: string;
}
