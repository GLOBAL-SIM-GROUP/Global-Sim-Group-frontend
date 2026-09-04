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
 * Le schéma généré type `id_categorie_produit`/api/v1/`id_fournisseur` en objet libre
 * (`Record<string, never> | null`) mais ce sont de vrais ids ; on élargit ces
 * champs (même pattern que `equipements`/api/v1/`etat` côté logements).
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

/** Appels API du module Marchandise — produits (chemins `/api/v1/market/*`). */
export function listProduits(params?: ListProduitsParams): Promise<Produit[]> {
	const searchParams = new URLSearchParams();
	if (params?.search) searchParams.append("search", params.search);
	if (params?.categorie) searchParams.append("categorie", params.categorie);
	if (params?.fournisseur)
		searchParams.append("fournisseur", params.fournisseur);

	const queryString = searchParams.toString();
	const path = `/api/v1/market/produits${queryString ? `?${queryString}` : ""}`;

	return getApiClient()
		.apiFetch<ProduitWire[]>(path)
		.then((data) =>
			data.map(({ id_produit: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Catégories de produits (GET /market/categories-produits). */
export function listCategoriesProduits(): Promise<CategorieProduit[]> {
	return getApiClient()
		.apiFetch<CategorieProduitWire[]>("/api/v1/market/categories-produits")
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
		.apiFetch<FournisseurWire[]>("/api/v1/market/fournisseurs")
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
	imageUrl?: string | null;
	/** Code-barres fabricant scanné à la saisie ; `null` pour ne pas en poser (génération interne possible ensuite). */
	codeBarre?: string | null;
}

/**
 * Crée un produit (POST `CreerProduitDto` — date d'entrée auto backend). Le
 * spec ne documente pas la réponse mais le backend réel renvoie le produit
 * créé en entier (vérifié en direct, 2026-09-04) — nécessaire pour l'ajouter
 * immédiatement à un panier de vente en cours (création à la volée sur un
 * scan sans correspondance, cf. `vente-form.tsx`).
 */
export function creerProduit(body: ProduitBody): Promise<Produit> {
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
		image_url: texteOuNull(body.imageUrl),
		code_barre: texteOuNull(body.codeBarre),
	} satisfies Omit<
		CreerProduitDto,
		| "id_categorie_produit"
		| "id_fournisseur"
		| "quantite_initiale"
		| "seuil_alerte"
		| "image_url"
		| "code_barre"
	> & {
		/** Absent du schéma généré (même écart que `id_categorie_produit`
		 *  etc. ci-dessus) mais bien accepté par le backend — voir GET
		 *  `/market/produits` qui le renvoie systématiquement. */
		reference: string;
		id_categorie_produit?: string | null;
		id_fournisseur?: string | null;
		quantite_initiale?: string | null;
		seuil_alerte?: string | null;
		image_url?: string | null;
		code_barre?: string | null;
	};
	return getApiClient()
		.apiFetch<ProduitWire>("/api/v1/market/produits", {
			method: "POST",
			body: JSON.stringify(corps),
		})
		.then(({ id_produit: id, ...reste }) => ({ id, ...reste }));
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
		image_url: texteOuNull(body.imageUrl),
		code_barre: texteOuNull(body.codeBarre),
	} satisfies Omit<
		MajProduitDto,
		| "id_categorie_produit"
		| "id_fournisseur"
		| "seuil_alerte"
		| "image_url"
		| "code_barre"
	> & {
		/** Absent du schéma généré mais bien accepté par le backend — voir
		 *  `creerProduit` ci-dessus. */
		reference: string;
		id_categorie_produit?: string | null;
		id_fournisseur?: string | null;
		seuil_alerte?: string | null;
		image_url?: string | null;
		code_barre?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/market/produits/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/**
 * Résout un code-barres scanné vers son produit (`GET
 * /market/produits/scan/:code_barre`). 404 explicite si aucun produit ne
 * porte ce code — remonte comme `ApiError`, à distinguer par l'appelant
 * (pas une liste vide : une vraie erreur « produit inconnu »).
 */
export function scannerProduit(codeBarre: string): Promise<Produit> {
	return getApiClient()
		.apiFetch<ProduitWire>(
			`/api/v1/market/produits/scan/${encodeURIComponent(codeBarre)}`,
		)
		.then(({ id_produit: id, ...reste }) => ({ id, ...reste }));
}

/**
 * Génère et pose un code-barres interne EAN-13 (POST
 * `/market/produits/:id/code-barre`, aucun body). Refuse (400) si le produit
 * a déjà un code — il faut d'abord le retirer via `modifierProduit({
 * codeBarre: null })`.
 */
export function genererCodeBarre(id: string): Promise<Produit> {
	return getApiClient()
		.apiFetch<ProduitWire>(`/api/v1/market/produits/${id}/code-barre`, {
			method: "POST",
		})
		.then(({ id_produit: pid, ...reste }) => ({ id: pid, ...reste }));
}

/**
 * Image PNG de l'étiquette à imprimer (`GET
 * /market/produits/:id/etiquette`), en URL de blob objet — un `<img src>`
 * brut vers l'API ne fonctionnerait pas (pas d'en-tête d'autorisation) ;
 * `download()` est le seul mécanisme du client API qui attache le Bearer
 * token pour du binaire (même famille que `printFacturePdf`).
 */
export function getEtiquetteBlobUrl(id: string): Promise<string> {
	return getApiClient()
		.download(`/api/v1/market/produits/${id}/etiquette`)
		.then((blob) => URL.createObjectURL(blob));
}
