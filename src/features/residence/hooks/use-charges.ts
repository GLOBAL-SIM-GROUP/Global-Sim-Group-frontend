import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	type ChargeBody,
	creerCharge,
	listCategoriesCharges,
	listCharges,
} from "../api/charges";
import { categoriesChargesKeys, chargesKeys } from "../permissions";

/**
 * Toutes les charges. Le param `logement` du lister renvoie un 500 sur le
 * backend réel : le filtrage par logement se fait côté client.
 */
export function useCharges() {
	return useQuery({ queryKey: chargesKeys.list(), queryFn: listCharges });
}

/** Catégories de charges (select du formulaire). */
export function useCategoriesCharges() {
	return useQuery({
		queryKey: categoriesChargesKeys.list(),
		queryFn: listCategoriesCharges,
	});
}

/** Crée une charge (POST). Invalide la liste au succès. */
export function useCreerCharge() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: ChargeBody) => creerCharge(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: chargesKeys.all });
		},
	});
}
