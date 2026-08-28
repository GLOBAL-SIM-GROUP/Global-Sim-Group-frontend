import { useQuery } from "@tanstack/react-query";
import {
	type FactureSourceType,
	type FactureStatut,
	findFacture,
	type Facture,
	listFactures,
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

/**
 * Liste les factures avec filtres.
 * Utilisé par la page d'admin pour afficher toutes les factures.
 */
export function useListFactures(params?: {
	sourceType?: FactureSourceType;
	statut?: FactureStatut;
	idClient?: string;
	recherche?: string;
	du?: string;
	au?: string;
	limit?: number;
	offset?: number;
}) {
	return useQuery({
		queryKey: ["factures", params],
		queryFn: () => listFactures(params),
	});
}
