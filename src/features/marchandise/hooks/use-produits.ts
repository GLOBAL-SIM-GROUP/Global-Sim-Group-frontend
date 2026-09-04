import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
	creerCategorieProduit,
	creerProduit,
	genererCodeBarre,
	getEtiquetteBlobUrl,
	type ListProduitsParams,
	listCategoriesProduits,
	listFournisseurs,
	listProduits,
	modifierProduit,
	type ProduitBody,
	scannerProduit,
} from "../api/produits";
import {
	categoriesProduitsKeys,
	fournisseursKeys,
	produitsKeys,
} from "../permissions";

/** Catalogue des produits avec filtres côté backend. */
export function useProduits(params?: ListProduitsParams) {
	return useQuery({
		queryKey: produitsKeys.list(
			params?.search,
			params?.categorie,
			params?.fournisseur,
		),
		queryFn: () => listProduits(params),
	});
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

/**
 * Résout un scan de code-barres (mutation ponctuelle déclenchée par
 * événement clavier — pas une query, il n'y a pas de clé de cache à tenir
 * à jour pour un lookup fait « à la volée »).
 */
export function useScannerProduit() {
	return useMutation({
		mutationFn: (codeBarre: string) => scannerProduit(codeBarre),
	});
}

/** Génère un code-barres interne pour un produit. Invalide le catalogue. */
export function useGenererCodeBarre() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => genererCodeBarre(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: produitsKeys.all });
		},
	});
}

/**
 * Charge l'image d'étiquette d'un produit en URL de blob objet. Local à ce
 * hook (pas le cache LRU partagé d'`use-upload-blob.ts`, spécifique aux clés
 * MinIO) : une étiquette n'est consultée que ponctuellement dans un
 * dialogue, la révocation au démontage/changement d'id suffit.
 */
export function useEtiquetteBlobUrl(idProduit: string | null) {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!idProduit) {
			setBlobUrl(null);
			return;
		}
		let annule = false;
		let urlCourante: string | null = null;
		setIsLoading(true);
		setError(null);
		getEtiquetteBlobUrl(idProduit)
			.then((url) => {
				if (annule) {
					URL.revokeObjectURL(url);
					return;
				}
				urlCourante = url;
				setBlobUrl(url);
			})
			.catch((err) => {
				if (!annule) {
					setError(err instanceof Error ? err : new Error(String(err)));
				}
			})
			.finally(() => {
				if (!annule) setIsLoading(false);
			});
		return () => {
			annule = true;
			if (urlCourante) URL.revokeObjectURL(urlCourante);
		};
	}, [idProduit]);

	return { blobUrl, isLoading, error };
}
