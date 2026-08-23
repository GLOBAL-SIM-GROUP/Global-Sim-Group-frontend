import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Mouvement, MouvementType } from "../models/mouvements";
import type { AlerteStock } from "../models/statistiques";

type AjouterMouvementDto = components["schemas"]["AjouterMouvementDto"];

/**
 * Le schéma généré type `motif`/`document_ref` en objet libre
 * (`Record<string, never> | null`) mais ce sont de vraies valeurs ; on élargit
 * ces champs (même pattern que `equipements`/`etat` côté logements).
 */
const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/** Appels API du module Marchandise — mouvements de stock (`/market/*`). */
export function listMouvements(): Promise<Mouvement[]> {
	return getApiClient()..apiFetch<Mouvement[]>("/market/stock/historique");
}

/** Produits en alerte stock (GET /market/stock/alerte). */
export function listStockAlerte(): Promise<AlerteStock[]> {
	return getApiClient()..apiFetch<AlerteStock[]>("/market/stock/alerte");
}

/** Corps saisi par le formulaire « Ajouter un mouvement ». */
export interface MouvementBody {
	idProduit: string;
	type: MouvementType;
	/** Signé pour AJUSTEMENT. */
	quantite: string;
	motif?: string | null;
	documentRef?: string | null;
}

/** Ajoute un mouvement de stock (POST `AjouterMouvementDto`). */
export function creerMouvement(body: MouvementBody): Promise<unknown> {
	const corps = {
		id_produit: body.idProduit,
		type: body.type,
		quantite: body.quantite,
		motif: texteOuNull(body.motif),
		document_ref: texteOuNull(body.documentRef),
	} satisfies Omit<AjouterMouvementDto, "motif" | "document_ref"> & {
		motif?: string | null;
		document_ref?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/market/mouvements", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
