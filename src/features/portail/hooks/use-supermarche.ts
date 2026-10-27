import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerVentePortail,
	creerVentePortail,
	getVentePortail,
	listMesVentesPortail,
	type VentePortailBody,
} from "../api/market";
import { marketVentesKeys } from "../permissions";

/** Liste des demandes boutique du résident connecté. */
export function useMesVentesPortail() {
	return useQuery({
		queryKey: marketVentesKeys.list(),
		queryFn: listMesVentesPortail,
	});
}

/** Détail d'une demande (lignes embarquées). `retry: false` : 404 = introuvable ou pas à lui. */
export function useVentePortail(id: string) {
	return useQuery({
		queryKey: marketVentesKeys.detail(id),
		queryFn: () => getVentePortail(id),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Envoie une demande d'achat boutique (POST portail → EN_ATTENTE). */
export function useCreerVentePortail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: VentePortailBody) => creerVentePortail(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: marketVentesKeys.all,
			});
		},
	});
}

/** Annule une demande encore `EN_ATTENTE` (motif optionnel). */
export function useAnnulerVentePortail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, motif }: { id: string; motif?: string }) =>
			annulerVentePortail(id, motif),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: marketVentesKeys.all,
			});
		},
	});
}
