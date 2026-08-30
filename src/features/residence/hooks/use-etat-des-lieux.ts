import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	ajouterEtatDesLieux,
	type EtatDesLieuxBody,
	listEtatDesLieux,
	supprimerEtatDesLieux,
} from "../api/etat-des-lieux";
import type { EtatDesLieuxType } from "../models/etat-des-lieux";
import { etatDesLieuxKeys } from "../permissions";

/** Photos d'état des lieux d'un contrat, filtrées par type (ENTREE/SORTIE). */
export function useEtatDesLieux(
	idContrat: string | undefined,
	type?: EtatDesLieuxType,
) {
	return useQuery({
		queryKey: etatDesLieuxKeys.list(idContrat ?? "aucun", type ?? "tous"),
		queryFn: () => listEtatDesLieux(idContrat as string, type),
		enabled: Boolean(idContrat),
	});
}

/** Lie une photo uploadée au contrat. Invalide la liste au succès. */
export function useAjouterEtatDesLieux() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			idContrat,
			...body
		}: { idContrat: string } & EtatDesLieuxBody) =>
			ajouterEtatDesLieux(idContrat, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: etatDesLieuxKeys.all });
		},
	});
}

/** Supprime une photo d'état des lieux. Invalide la liste au succès. */
export function useSupprimerEtatDesLieux() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => supprimerEtatDesLieux(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: etatDesLieuxKeys.all });
		},
	});
}
