import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	type EncaisserBody,
	encaisserEcheance,
	listEcheances,
} from "../api/suivi";
import { contratsKeys, suiviKeys } from "../permissions";

/**
 * Suivi consolidé des échéances. `statut`/api/v1/`du`/api/v1/`au` sont envoyés au serveur
 * (params réels du lister `/api/v1/suivi`) et portés par la clé de requête → refetch
 * au changement. « tous » n'est pas envoyé.
 */
export function useEcheances(statut: string, du?: string, au?: string) {
	return useQuery({
		queryKey: suiviKeys.list(statut, du, au),
		queryFn: () =>
			listEcheances({ statut: statut !== "tous" ? statut : undefined, du, au }),
	});
}

/**
 * Encaisser une échéance. Invalide la fiche contrat (échéances embarquées) et
 * le suivi au succès.
 */
export function useEncaisserEcheance() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: EncaisserBody & { id: string }) =>
			encaisserEcheance(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
			void queryClient.invalidateQueries({ queryKey: suiviKeys.all });
		},
	});
}
