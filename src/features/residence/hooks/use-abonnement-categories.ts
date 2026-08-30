import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerAbonnementCategorie,
	listAbonnementCategories,
	modifierAbonnementCategorie,
	supprimerAbonnementCategorie,
} from "../api/abonnement-categories";
import { abonnementCategoriesKeys } from "../permissions";

/** Catégories d'abonnement (select du formulaire d'abonnement + page de gestion). */
export function useAbonnementCategories() {
	return useQuery({
		queryKey: abonnementCategoriesKeys.list(),
		queryFn: listAbonnementCategories,
	});
}

/** Invalide les catégories après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({
			queryKey: abonnementCategoriesKeys.all,
		});
	};
}

export function useCreerAbonnementCategorie() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (body: { libelle: string }) => creerAbonnementCategorie(body),
		onSuccess: invalider,
	});
}

export function useModifierAbonnementCategorie() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (body: { id: string; libelle: string }) =>
			modifierAbonnementCategorie(body.id, { libelle: body.libelle }),
		onSuccess: invalider,
	});
}

export function useSupprimerAbonnementCategorie() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => supprimerAbonnementCategorie(id),
		onSuccess: invalider,
	});
}
