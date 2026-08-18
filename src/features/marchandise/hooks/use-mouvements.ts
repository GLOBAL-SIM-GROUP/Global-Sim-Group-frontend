import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerMouvement,
	listMouvements,
	listStockAlerte,
	type MouvementBody,
} from "../api/mouvements";
import { mouvementsKeys, produitsKeys, stockKeys } from "../permissions";

/** Historique des mouvements de stock. */
export function useMouvements() {
	return useQuery({
		queryKey: mouvementsKeys.list(),
		queryFn: listMouvements,
	});
}

/** Produits en alerte stock. */
export function useStockAlerte() {
	return useQuery({
		queryKey: stockKeys.list(),
		queryFn: listStockAlerte,
	});
}

/** Ajoute un mouvement (POST). Invalide mouvements + produits au succès. */
export function useCreerMouvement() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: MouvementBody) => creerMouvement(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: mouvementsKeys.all });
			void queryClient.invalidateQueries({ queryKey: produitsKeys.all });
			void queryClient.invalidateQueries({ queryKey: stockKeys.all });
		},
	});
}
