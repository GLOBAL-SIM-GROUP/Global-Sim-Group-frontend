import { useQuery } from "@tanstack/react-query";
import {
	type FactureSourceType,
	findFacture,
	type Facture,
} from "../facturation";

/**
 * Cherche une facture payée pour une transaction donnée.
 * Utile pour afficher un bouton de téléchargement de reçu.
 */
export function useFindFacture(
	sourceType: FactureSourceType,
	idClient: string | null,
	montantTotal?: string,
) {
	return useQuery({
		queryKey: ["facture", sourceType, idClient, montantTotal],
		queryFn: async (): Promise<Facture | null> => {
			if (!idClient) {
				return null;
			}
			return findFacture(sourceType, idClient, montantTotal);
		},
		enabled: !!idClient,
	});
}
