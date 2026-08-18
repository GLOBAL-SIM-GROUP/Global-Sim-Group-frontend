import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerCategoriePlat,
	creerPlat,
	listCategoriesPlats,
	listPlats,
	modifierPlat,
	type PlatBody,
} from "../api/plats";
import { categoriesPlatsKeys, platsKeys } from "../permissions";

/** Carte des plats. */
export function usePlats() {
	return useQuery({ queryKey: platsKeys.list(), queryFn: listPlats });
}

/** Catégories de plats (selects du formulaire et des filtres). */
export function useCategoriesPlats() {
	return useQuery({
		queryKey: categoriesPlatsKeys.list(),
		queryFn: listCategoriesPlats,
	});
}

/** Crée un plat (POST). Invalide la carte au succès. */
export function useCreerPlat() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: PlatBody) => creerPlat(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: platsKeys.all });
		},
	});
}

/** Modifie un plat (PATCH par id). Invalide la carte au succès. */
export function useModifierPlat() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: PlatBody & { id: string }) =>
			modifierPlat(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: platsKeys.all });
		},
	});
}

/** Crée une catégorie de plat. Invalide les catégories au succès. */
export function useCreerCategoriePlat() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { libelle: string }) => creerCategoriePlat(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: categoriesPlatsKeys.all });
		},
	});
}
