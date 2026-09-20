import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerDepotPressing,
	getPressingCommande,
	getRecuCommandePressing,
	listPressingCommandes,
} from "../api/pressing";
import { pressingCommandesKeys, recuPressingKeys } from "../permissions";

/**
 * Récupère la liste des commandes de pressing du résident actuel.
 */
export function usePressingCommandes() {
	return useQuery({
		queryKey: pressingCommandesKeys.list(),
		queryFn: () => listPressingCommandes(),
	});
}

/**
 * Récupère le détail d'une commande de pressing.
 */
export function usePressingCommande(id: string) {
	return useQuery({
		queryKey: pressingCommandesKeys.detail(id),
		queryFn: () => getPressingCommande(id),
		enabled: typeof window !== "undefined" && !!id,
		retry: false,
	});
}

/** Annule une demande de dépôt encore `EN_ATTENTE`. */
export function useAnnulerDepotPressing() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => annulerDepotPressing(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: pressingCommandesKeys.all,
			});
		},
	});
}

/**
 * Reçu JSON d'une commande (modale). `enabled` : la requête ne part qu'à
 * l'ouverture de la modale ; `retry: false` — un 404/400 veut dire « pas de
 * reçu disponible », inutile de retenter.
 */
export function useRecuCommandePressing(id: string | null, enabled = true) {
	return useQuery({
		queryKey: recuPressingKeys.detail(id ?? "aucun"),
		queryFn: () => getRecuCommandePressing(id as string),
		enabled: enabled && Boolean(id),
		retry: false,
	});
}
