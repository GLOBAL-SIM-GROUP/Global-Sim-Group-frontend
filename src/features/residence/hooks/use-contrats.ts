import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	activerContrat,
	type ContratBody,
	creerContrat,
	getCaution,
	getContrat,
	listContrats,
	restituerCaution,
} from "../api/contrats";
import { contratsKeys } from "../permissions";

/** Liste de tous les contrats de location. */
export function useContrats() {
	return useQuery({ queryKey: contratsKeys.list(), queryFn: listContrats });
}

/**
 * Détail d'un contrat (échéances embarquées). `retry: false` : un 404 est un
 * contrat introuvable, pas une erreur à re-tenter.
 */
export function useContratDetail(id: string | undefined) {
	return useQuery({
		queryKey: contratsKeys.detail(id ?? "aucun"),
		queryFn: () => getContrat(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Crée un contrat (POST). Invalide la liste au succès. */
export function useCreerContrat() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: ContratBody) => creerContrat(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
		},
	});
}

/** Active un contrat en attente. Invalide la liste au succès. */
export function useActiverContrat() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => activerContrat(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
		},
	});
}

/**
 * Caution d'un contrat. `retry: false` : le 404 « aucune caution » est un état
 * vide (à afficher comme tel), pas une erreur.
 */
export function useCaution(idContrat: string | undefined) {
	return useQuery({
		queryKey: contratsKeys.list(idContrat ?? "aucun", "caution"),
		queryFn: () => getCaution(idContrat as string),
		enabled: Boolean(idContrat),
		retry: false,
	});
}

/** Restitue la caution. Invalide contrat + caution au succès. */
export function useRestituerCaution() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			idContrat,
			...body
		}: { idContrat: string } & {
			retenue?: string | null;
			motif_retenue?: string | null;
		}) => restituerCaution(idContrat, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
		},
	});
}
