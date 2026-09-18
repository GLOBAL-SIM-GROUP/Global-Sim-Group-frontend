/**
 * Ligne de panier restaurant — alias historique du cœur générique
 * (`LigneArticlePanier` dans `panier-articles.ts`) : `platId` gardé au lieu
 * de `id` pour ne pas casser `restaurant-page.tsx` ni les tests existants
 * lors de la généralisation du panier à d'autres services (boutique).
 */
export interface LignePanier {
	platId: string;
	nom: string;
	prix: string;
	imageUrl: string | null;
	quantite: number;
}
