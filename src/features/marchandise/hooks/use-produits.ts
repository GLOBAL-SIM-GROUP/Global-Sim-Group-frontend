import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerCategorieProduit,
	creerProduit,
	listCategoriesProduits,
	listFournisseurs,
	listProduits,
	modifierProduit,
	type ProduitBody,
} from "../api/produits";
import {
	categoriesProduitsKeys,
	fournisseursKeys,
	produitsKeys,
} from "../permissions";

/** Catalogue des produits. */
export function useProduits() {
	return useQuery({ queryKey: produitsKeys.list(), queryFn: listProduits });
}

/** Catégories de produits (selects du formulaire et des filtres). */
export function useCategoriesProduits() {
	return useQuery({
		queryKey: categoriesProduitsKeys.list(),
		queryFn: listCategoriesProduits,
	});
}

/** Fournisseurs (selects du formulaire et des filtres). */
export function useFournisseurs() {
	return useQuery({
		queryKey: fournisseursKeys.list(),
		queryFn: listFournisseurs,
	});
}

/** Crée une catégorie de produit (POST). Invalide les catégories au succès. */
export function useCreerCategorieProduit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { libelle: string }) => creerCategorieProduit(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: categoriesProduitsKeys.all,
			});
		},
	});
}

/** Crée un produit (POST). Invalide le catalogue au succès. */
export function useCreerProduit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: ProduitBody) => creerProduit(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: produitsKeys.all });
		},
	});
}

/** Modifie un produit (PATCH par id). Invalide le catalogue au succès. */
export function useModifierProduit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: ProduitBody & { id: string }) =>
			modifierProduit(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: produitsKeys.all });
		},
	});
}
