import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerCommandeRestaurantPortail,
	type CommandeRestaurantPortailBody,
	creerCommandeRestaurantPortail,
	getCommandeRestaurantPortail,
	listMesCommandesRestaurant,
} from "../api/restaurant";
import { restaurantCommandesKeys } from "../permissions";

/** Liste des commandes restaurant du résident connecté. */
export function useMesCommandesRestaurant() {
	return useQuery({
		queryKey: restaurantCommandesKeys.list(),
		queryFn: listMesCommandesRestaurant,
	});
}

/** Détail d'une commande (lignes embarquées). `retry: false` : 404 = introuvable ou pas à lui. */
export function useCommandeRestaurantPortail(id: string) {
	return useQuery({
		queryKey: restaurantCommandesKeys.detail(id),
		queryFn: () => getCommandeRestaurantPortail(id),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Envoie une commande en ligne (POST portail). */
export function useCreerCommandeRestaurant() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CommandeRestaurantPortailBody) =>
			creerCommandeRestaurantPortail(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: restaurantCommandesKeys.all,
			});
		},
	});
}

/** Annule une commande encore `EN_ATTENTE`. */
export function useAnnulerCommandeRestaurant() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => annulerCommandeRestaurantPortail(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: restaurantCommandesKeys.all,
			});
		},
	});
}
