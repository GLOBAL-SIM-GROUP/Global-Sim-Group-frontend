import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	type BatimentBody,
	basculerBatimentActif,
	creerBatiment,
	listBatiments,
	modifierBatiment,
	supprimerBatiment,
} from "../api/batiments";
import { batimentsKeys } from "../permissions";

/**
 * Charge la liste des bâtiments. Clé stable via `batimentsKeys` ; l'UI ne lit
 * jamais `useAuth()` directement (règle features) — les permissions passent
 * par `useCan`.
 */
export function useBatiments() {
	return useQuery({
		queryKey: batimentsKeys.list(),
		queryFn: listBatiments,
	});
}

/** Crée un bâtiment (POST). Invalide la liste au succès. */
export function useCreerBatiment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: BatimentBody) => creerBatiment(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: batimentsKeys.all });
		},
	});
}

/** Modifie un bâtiment existant (PATCH par id). Invalide la liste au succès. */
export function useModifierBatiment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: BatimentBody & { id: string }) =>
			modifierBatiment(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: batimentsKeys.all });
		},
	});
}

/** Bascule le statut `actif` d'un bâtiment (PATCH). */
export function useBasculerBatiment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
			basculerBatimentActif(id, actif),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: batimentsKeys.all });
		},
	});
}

/** Supprime un bâtiment (DELETE par id). */
export function useSupprimerBatiment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: supprimerBatiment,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: batimentsKeys.all });
		},
	});
}
