import { getApiClient } from "#/core/api";

import type { AbonnementCategorie } from "../models/abonnement-categories";

/**
 * Clé wire supposée (voir models/abonnement-categories.ts) : par analogie avec
 * `id_categorie_charge`, non confirmée par un schéma généré.
 */
type AbonnementCategorieWire = Omit<AbonnementCategorie, "id"> & {
	id_categorie_abonnement: string;
};

const toAbonnementCategorie = ({
	id_categorie_abonnement: id,
	...reste
}: AbonnementCategorieWire): AbonnementCategorie => ({ id, ...reste });

/**
 * Appels API du module Abonnement — catégories. Module backend distinct de
 * Résidence (préfixe `/api/v1/abonnement/`, pas `/api/v1/residence/`). Le
 * Detail (`GET /abonnement/categories/{id}`) existe côté backend mais n'est
 * consommé par aucune page ici — le lister suffit à peupler la liste et la
 * modale d'édition.
 */
export function listAbonnementCategories(): Promise<AbonnementCategorie[]> {
	return getApiClient()
		.apiFetch<AbonnementCategorieWire[]>("/api/v1/abonnement/categories")
		.then((data) => data.map(toAbonnementCategorie));
}

/** Crée une catégorie d'abonnement (POST). */
export function creerAbonnementCategorie(body: {
	libelle: string;
}): Promise<AbonnementCategorie> {
	return getApiClient()
		.apiFetch<AbonnementCategorieWire>("/api/v1/abonnement/categories", {
			method: "POST",
			body: JSON.stringify(body),
		})
		.then(toAbonnementCategorie);
}

/** Modifie une catégorie d'abonnement (PATCH par id). */
export function modifierAbonnementCategorie(
	id: string,
	body: { libelle: string },
): Promise<AbonnementCategorie> {
	return getApiClient()
		.apiFetch<AbonnementCategorieWire>(`/api/v1/abonnement/categories/${id}`, {
			method: "PATCH",
			body: JSON.stringify(body),
		})
		.then(toAbonnementCategorie);
}

/** Supprime une catégorie d'abonnement (DELETE par id). */
export function supprimerAbonnementCategorie(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/abonnement/categories/${id}`, {
		method: "DELETE",
	});
}
