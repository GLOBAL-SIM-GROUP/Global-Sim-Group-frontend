import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	CategorieProduit,
	Fournisseur,
	Produit,
} from "../models/produits";

type CreerProduitDto = components["schemas"]["CreerProduitDto"];
type MajProduitDto = components["schemas"]["MajProduitDto"];
type CreerCategorieProduitDto =
	components["schemas"]["CreerCategorieProduitDto"];

/**
 * Le schéma généré type `id_categorie_produit`/`id_fournisseur` en objet libre
 * (`Record<string, never> | null`) mais ce sont de vrais ids ; on élargit ces
 * champs (même pattern que `equipements`/`etat` côté logements).
 */
type ProduitWire = Omit<Produit, "id"> & { id_produit: string };
type CategorieProduitWire = Omit<CategorieProduit, "id"> & {
	id_categorie_produit: string;
};
type FournisseurWire = Omit<Fournisseur, "id"> & { id_fournisseur: string };

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

export interface ListProduitsParams {
	search?: string;
	categorie?: string;
	fournisseur?: string;
}

/** Appels API du module Marchandise — produits (chemins `/market/*`). */
export function listProduits(params?: ListProduitsParams): Promise<Produit[]> {
	const searchParams = new URLSearchParams();
	if (params?.search) searchParams.append("search", params.search);
	if (params?.categorie) searchParams.append("categorie", params.categorie);
	if (params?.fournisseur) searchParams.append("fournisseur", params.fournisseur);

	const queryString = searchParams.toString();
	const path = `/market/produits${queryString ? `?${queryString}` : ""}`;

	return getApiClient()
		..apiFetch<ProduitWire[]>(path)
		.then((data) =>
			data.map(({ id_produit: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Catégories de produits (GET /market/categories-produits). */
export function listCategoriesProduits(): Promise<CategorieProduit[]> {
	return getApiClient()
		..apiFetch<CategorieProduitWire[]>("/api/v1/market/categories-produits")
		.then((data) =>
			data.map(({ id_categorie_produit: id, ...reste }) => ({ id, ...reste })),
		);
}

/**
 * Crée une catégorie de produit (POST `CreerCategorieProduitDto`). Aucun
 * endpoint de suppression/modification dans le spec → la catégorie ne peut que
 * s'ajouter (suppression à prévoir côté backend).
 */
export function creerCategorieProduit(body: {
	libelle: string;
}): Promise<unknown> {
	const corps = { libelle: body.libelle } satisfies CreerCategorieProduitDto;
	return getApiClient().apiFetch("/api/v1/market/categories-produits", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Fournisseurs (GET /market/fournisseurs). */
export function listFournisseurs(): Promise<Fournisseur[]> {
	return getApiClient()
		..apiFetch<FournisseurWire[]>("/api/v1/market/fournisseurs")
		.then((data) =>
			data.map(({ id_fournisseur: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Corps saisi par le formulaire produit (create/update). */
export interface ProduitBody {
	reference: string;
	nom: string;
	idCategorieProduit?: string | null;
	prixAchat: string;
	prixVente: string;
	quantiteInitiale?: string | null;
	seuilAlerte?: string | null;
	idFournisseur?: string | null;
	actif?: boolean;
}

/** Crée un produit (POST `CreerProduitDto` — date d'entrée auto backend). */
export function creerProduit(body: ProduitBody): Promise<unknown> {
	const corps = {
		reference: body.reference,
		nom: body.nom,
		id_categorie_produit: texteOuNull(body.idCategorieProduit),
		prix_achat: body.prixAchat,
		prix_vente: body.prixVente,
		quantite_initiale: texteOuNull(body.quantiteInitiale),
		seuil_alerte: texteOuNull(body.seuilAlerte),
		id_fournisseur: texteOuNull(body.idFournisseur),
		actif: body.actif ?? true,
	} satisfies Omit<
		CreerProduitDto,
		| "id_categorie_produit"
		| "id_fournisseur"
		| "quantite_initiale"
		| "seuil_alerte"
	> & {
		id_categorie_produit?: string | null;
		id_fournisseur?: string | null;
		quantite_initiale?: string | null;
		seuil_alerte?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/market/produits", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie un produit (PATCH `MajProduitDto`). */
export function modifierProduit(
	id: string,
	body: ProduitBody,
): Promise<unknown> {
	const corps = {
		reference: body.reference,
		nom: body.nom,
		id_categorie_produit: texteOuNull(body.idCategorieProduit),
		prix_achat: body.prixAchat,
		prix_vente: body.prixVente,
		seuil_alerte: texteOuNull(body.seuilAlerte),
		id_fournisseur: texteOuNull(body.idFournisseur),
		actif: body.actif ?? true,
	} satisfies Omit<
		MajProduitDto,
		"id_categorie_produit" | "id_fournisseur" | "seuil_alerte"
	> & {
		id_categorie_produit?: string | null;
		id_fournisseur?: string | null;
		seuil_alerte?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/market/produits/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}
