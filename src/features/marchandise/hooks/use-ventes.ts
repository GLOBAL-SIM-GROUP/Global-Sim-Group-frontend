import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerVente,
	creerVente,
	getVente,
	listRapportVentes,
	listVentes,
	type ListVentesParams,
	type VenteBody,
} from "../api/ventes";
import { produitsKeys, rapportVentesKeys, ventesKeys } from "../permissions";

/** Historique des ventes avec filtres côté backend. */
export function useVentes(params?: ListVentesParams) {
	return useQuery({
		queryKey: ventesKeys.list(params?.search),
		queryFn: () => listVentes(params),
	});
}

/** Détail d'une vente (lignes embarquées). `retry: false` : 404 = introuvable. */
export function useVente(id: string | undefined) {
	return useQuery({
		queryKey: ventesKeys.detail(id ?? "aucun"),
		queryFn: () => getVente(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Enregistre une vente (POST). Invalide ventes + produits au succès. */
export function useCreerVente() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: VenteBody) => creerVente(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ventesKeys.all });
			void queryClient.invalidateQueries({ queryKey: produitsKeys.all });
		},
	});
}

/** Annule une vente (POST annuler). Invalide ventes + produits. */
export function useAnnulerVente() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => annulerVente(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ventesKeys.all });
			void queryClient.invalidateQueries({ queryKey: produitsKeys.all });
		},
	});
}

/** Rapports de ventes (période portée par la clé de requête). */
export function useRapportVentes(du?: string, au?: string) {
	return useQuery({
		queryKey: rapportVentesKeys.list(du, au),
		queryFn: () => listRapportVentes(du, au),
	});
}
