import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerCommande,
	creerCommande,
	getCommande,
	listCommandes,
	listRapportVentes,
	majStatutCommande,
} from "../api/commandes";
import type { CommandeRestaurantStatut } from "../models/commandes";
import { commandesRestaurantKeys, rapportRestaurantKeys } from "../permissions";

/** Historique des commandes, avec les filtres serveur portés par la clé. */
export function useCommandes(statut: string, du?: string, au?: string) {
	return useQuery({
		queryKey: commandesRestaurantKeys.list(statut, du, au),
		queryFn: () => listCommandes({ statut, du, au }),
	});
}

/** Détail d'une commande (lignes embarquées). `retry: false` : 404 = introuvable. */
export function useCommande(id: string | undefined) {
	return useQuery({
		queryKey: commandesRestaurantKeys.detail(id ?? "aucun"),
		queryFn: () => getCommande(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Invalide commandes + plats (le statut/total peuvent changer les stocks ? non — plats inchangés). */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({
			queryKey: commandesRestaurantKeys.all,
		});
		void queryClient.invalidateQueries({ queryKey: rapportRestaurantKeys.all });
	};
}

/** Enregistre une commande (POST). */
export function useCreerCommande() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerCommande, onSuccess: invalider });
}

/** Modifie le statut d'une commande (POST statut). */
export function useMajStatutCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			statut,
		}: {
			id: string;
			statut: CommandeRestaurantStatut;
		}) => majStatutCommande(id, statut),
		onSuccess: invalider,
	});
}

/** Annule une commande. */
export function useAnnulerCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => annulerCommande(id),
		onSuccess: invalider,
	});
}

/** Rapports de ventes (période portée par la clé). */
export function useRapportVentes(du?: string, au?: string) {
	return useQuery({
		queryKey: rapportRestaurantKeys.list(du, au),
		queryFn: () => listRapportVentes(du, au),
	});
}
