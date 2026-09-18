import type { Plat } from "#/features/restaurant/models/plats";

import type { LignePanier } from "../models/panier";
import { CLE_PANIER_RESTAURANT } from "../models/panier-articles";
import { usePanierArticles } from "./use-panier-articles";

/**
 * Panier du restaurant — adaptateur au-dessus du cœur générique
 * `usePanierArticles` : garde le nom historique `platId` (au lieu de `id`)
 * pour ne pas casser `restaurant-page.tsx` ni ses tests existants. La
 * boutique (et les prochains services) appelle `usePanierArticles`
 * directement avec sa propre clé de stockage, sans passer par un adaptateur.
 */
export function usePanier() {
	const panier = usePanierArticles(CLE_PANIER_RESTAURANT);

	const lignes: LignePanier[] = panier.lignes.map((ligne) => ({
		platId: ligne.id,
		nom: ligne.nom,
		prix: ligne.prix,
		imageUrl: ligne.imageUrl,
		quantite: ligne.quantite,
	}));

	return {
		lignes,
		ajouter: (plat: Plat, imageUrl: string | null) =>
			panier.ajouter(plat, imageUrl),
		definirQuantite: panier.definirQuantite,
		vider: panier.vider,
		total: panier.total,
		nombreArticles: panier.nombreArticles,
	};
}
