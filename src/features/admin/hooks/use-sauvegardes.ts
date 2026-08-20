import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerSauvegardeManuelle,
	getConfigurationSauvegardes,
	listSauvegardes,
	majConfigurationSauvegardes,
	restaurerSauvegarde,
} from "../api/sauvegardes";
import { sauvegardesKeys } from "../permissions";

/** Historique des sauvegardes. */
export function useSauvegardes() {
	return useQuery({
		queryKey: sauvegardesKeys.list(),
		queryFn: listSauvegardes,
	});
}

/** Configuration des sauvegardes automatiques. */
export function useConfigurationSauvegardes() {
	return useQuery({
		queryKey: sauvegardesKeys.configuration(),
		queryFn: getConfigurationSauvegardes,
	});
}

/** Met à jour la configuration des sauvegardes. */
export function useMajConfigurationSauvegardes() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (config: {
			frequence: "quotidienne" | "hebdomadaire";
			activee: boolean;
		}) => majConfigurationSauvegardes(config),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: sauvegardesKeys.configuration(),
			});
		},
	});
}

/** Déclenche une sauvegarde manuelle. */
export function useCreerSauvegardeManuelle() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: creerSauvegardeManuelle,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: sauvegardesKeys.list(),
			});
		},
	});
}

/** Restaure une sauvegarde (action sensible). */
export function useRestaurerSauvegarde() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => restaurerSauvegarde(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: sauvegardesKeys.list(),
			});
		},
	});
}
