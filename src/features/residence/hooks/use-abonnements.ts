import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	type AbonnementBody,
	creerAbonnement,
	listAbonnements,
	type ModifierAbonnementBody,
	modifierAbonnement,
	resilierAbonnement,
} from "../api/abonnements";
import { abonnementsKeys } from "../permissions";

/** Liste de tous les abonnements (filtres appliqués côté client). */
export function useAbonnements() {
	return useQuery({
		queryKey: abonnementsKeys.list(),
		queryFn: listAbonnements,
	});
}

/** Souscrit un abonnement (POST). Invalide la liste au succès. */
export function useCreerAbonnement() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: AbonnementBody) => creerAbonnement(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: abonnementsKeys.all });
		},
	});
}

/** Modifie un abonnement (PATCH par id). Invalide la liste au succès. */
export function useModifierAbonnement() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: ModifierAbonnementBody & { id: string }) =>
			modifierAbonnement(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: abonnementsKeys.all });
		},
	});
}

/** Résilie un abonnement (POST resilier). Invalide la liste au succès. */
export function useResilierAbonnement() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => resilierAbonnement(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: abonnementsKeys.all });
		},
	});
}
