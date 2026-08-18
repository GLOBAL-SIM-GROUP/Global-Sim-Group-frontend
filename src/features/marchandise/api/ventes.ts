import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { RapportVentes } from "../models/statistiques";
import type { LigneVente, Vente, VenteDetail } from "../models/ventes";

type CreerVenteDto = components["schemas"]["CreerVenteDto"];

type VenteWire = Omit<Vente, "id"> & { id_vente: string };
type LigneVenteWire = Omit<LigneVente, "id"> & { id_ligne: string };
type VenteDetailWire = Omit<VenteDetail, "id" | "lignes"> & {
	id_vente: string;
	lignes: LigneVenteWire[];
};

/** Appels API du module Marchandise — ventes (chemins `/market/*`). */
export function listVentes(): Promise<Vente[]> {
	return getApiClient()
		.apiFetch<VenteWire[]>("/market/ventes")
		.then((data) =>
			data.map(({ id_vente: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'une vente : embarque les lignes (Voir la facture). */
export function getVente(id: string): Promise<VenteDetail> {
	return getApiClient()
		.apiFetch<VenteDetailWire>(`/market/ventes/${id}`)
		.then((data) => ({
			...(() => {
				const { id_vente: vid, ...reste } = data;
				return { id: vid, ...reste };
			})(),
			lignes: data.lignes.map(({ id_ligne: lid, ...reste }) => ({
				id: lid,
				...reste,
			})),
		}));
}

/** Ligne d'une vente à créer (le backend calcule prix/remise/totaux). */
export interface LigneVenteBody {
	idProduit: string;
	quantite: string;
}

/** Corps saisi par le formulaire « Nouvelle vente ». */
export interface VenteBody {
	lignes: LigneVenteBody[];
	remise?: string;
	idClient?: string | null;
	paiement: { montant: string; idMoyen: string };
}

/** Enregistre une vente (POST `CreerVenteDto`) : décrémente le stock. */
export function creerVente(body: VenteBody): Promise<unknown> {
	const corps = {
		lignes: body.lignes.map((ligne) => ({
			id_produit: ligne.idProduit,
			quantite: ligne.quantite,
		})),
		remise: body.remise ?? undefined,
		...(body.idClient ? { id_client: body.idClient } : {}),
		paiement: {
			montant: body.paiement.montant,
			id_moyen: body.paiement.idMoyen,
		},
	} satisfies Omit<CreerVenteDto, "id_client"> & { id_client?: string | null };
	return getApiClient().apiFetch("/market/ventes", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Annule une vente (POST `/market/ventes/{id}/annuler`). */
export function annulerVente(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/market/ventes/${id}/annuler`, {
		method: "POST",
	});
}

/** Rapports de ventes (GET /market/rapports/ventes, params période). */
export function listRapportVentes(
	du?: string,
	au?: string,
): Promise<RapportVentes> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	return getApiClient().apiFetch<RapportVentes>(
		`/market/rapports/ventes${qs ? `?${qs}` : ""}`,
	);
}
