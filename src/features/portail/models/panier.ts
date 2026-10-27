/**
 * Ligne de panier restaurant — alias historique du cœur générique
 * (`LigneArticlePanier` dans `panier-articles.ts`) : `platId` gardé au lieu
 * de `id` pour ne pas casser les consommateurs existants lors de la
 * généralisation du panier à d'autres services (super-marché).
 */
export interface LignePanier {
	platId: string;
	nom: string;
	prix: string;
	imageUrl: string | null;
	quantite: number;
}
