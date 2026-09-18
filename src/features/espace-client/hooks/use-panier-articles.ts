import { useCallback, useEffect, useState } from "react";

import {
	type ArticleSelectionnable,
	type LigneArticlePanier,
	ligneDepuisArticle,
	nombreArticlesPanier,
	totalPanier,
} from "../models/panier-articles";

function lireStockage(cle: string): LigneArticlePanier[] {
	if (typeof window === "undefined") return [];
	try {
		const brut = window.localStorage.getItem(cle);
		return brut ? (JSON.parse(brut) as LigneArticlePanier[]) : [];
	} catch {
		return [];
	}
}

/**
 * Cœur générique d'un panier d'articles (plat, produit…), paramétré par sa
 * clé de stockage — un panier indépendant par service (`usePanier` pour le
 * restaurant, la boutique appelle celui-ci directement avec sa propre clé),
 * jamais un panier partagé entre services. État initialisé vide (rendu SSR
 * sûr) puis hydraté depuis `localStorage` au montage.
 */
export function usePanierArticles(cleStockage: string) {
	const [lignes, setLignes] = useState<LigneArticlePanier[]>([]);

	useEffect(() => {
		setLignes(lireStockage(cleStockage));
	}, [cleStockage]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(cleStockage, JSON.stringify(lignes));
		} catch {
			// Stockage indisponible (navigation privée, quota) : le panier reste
			// utilisable pour la session en cours, juste pas persisté.
		}
	}, [cleStockage, lignes]);

	const ajouter = useCallback(
		(article: ArticleSelectionnable, imageUrl: string | null) => {
			setLignes((precedent) => {
				const existante = precedent.find((ligne) => ligne.id === article.id);
				if (existante) {
					return precedent.map((ligne) =>
						ligne.id === article.id
							? { ...ligne, quantite: ligne.quantite + 1 }
							: ligne,
					);
				}
				return [...precedent, ligneDepuisArticle(article, imageUrl)];
			});
		},
		[],
	);

	const definirQuantite = useCallback((id: string, quantite: number) => {
		setLignes((precedent) =>
			quantite <= 0
				? precedent.filter((ligne) => ligne.id !== id)
				: precedent.map((ligne) =>
						ligne.id === id ? { ...ligne, quantite } : ligne,
					),
		);
	}, []);

	const vider = useCallback(() => setLignes([]), []);

	return {
		lignes,
		ajouter,
		definirQuantite,
		vider,
		total: totalPanier(lignes),
		nombreArticles: nombreArticlesPanier(lignes),
	};
}
