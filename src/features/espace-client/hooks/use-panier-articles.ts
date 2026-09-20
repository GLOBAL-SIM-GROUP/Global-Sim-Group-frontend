import { useCallback, useEffect, useState } from "react";

import {
	type ArticleSelectionnable,
	CLE_PANIER_BOUTIQUE,
	CLE_PANIER_RESTAURANT,
	EVENEMENT_PANIER_MAJ,
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
	// L'effet de persistance ne doit pas écrire avant que la lecture initiale
	// ait été appliquée : il capturerait le `lignes` initial (`[]`) et viderait
	// le panier stocké — et sous `StrictMode` (rejeu des effets au montage) le
	// second passage relirait alors un stockage déjà vidé. `hydrate` est un
	// état (pas un ref) : l'effet d'écriture doit lire la valeur du rendu
	// courant, donc passer au re-render post-hydratation.
	const [hydrate, setHydrate] = useState(false);

	useEffect(() => {
		setLignes(lireStockage(cleStockage));
		setHydrate(true);
	}, [cleStockage]);

	useEffect(() => {
		if (typeof window === "undefined" || !hydrate) return;
		try {
			window.localStorage.setItem(cleStockage, JSON.stringify(lignes));
		} catch {
			// Stockage indisponible (navigation privée, quota) : le panier reste
			// utilisable pour la session en cours, juste pas persisté.
		}
		window.dispatchEvent(new Event(EVENEMENT_PANIER_MAJ));
	}, [cleStockage, lignes, hydrate]);

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

/**
 * Nombre total d'articles dans les paniers de tous les services (restaurant +
 * boutique) — pour le badge « panier » de la navbar. Relit `localStorage` à
 * chaque `EVENEMENT_PANIER_MAJ` (écriture dans cet onglet) et `storage`
 * (autres onglets).
 */
export function useNombreArticlesPaniers(): number {
	const [nombre, setNombre] = useState(0);

	useEffect(() => {
		const relire = () =>
			setNombre(
				nombreArticlesPanier(lireStockage(CLE_PANIER_RESTAURANT)) +
					nombreArticlesPanier(lireStockage(CLE_PANIER_BOUTIQUE)),
			);
		relire();
		window.addEventListener(EVENEMENT_PANIER_MAJ, relire);
		window.addEventListener("storage", relire);
		return () => {
			window.removeEventListener(EVENEMENT_PANIER_MAJ, relire);
			window.removeEventListener("storage", relire);
		};
	}, []);

	return nombre;
}
