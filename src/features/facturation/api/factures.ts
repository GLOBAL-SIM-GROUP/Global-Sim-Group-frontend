import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Facture, FactureDetail, LigneFacture } from "../models/factures";

type FacturerPrestationDto = components["schemas"]["FacturerPrestationDto"];
type CreerPaiementDto = components["schemas"]["CreerPaiementDto"];

type FactureWire = Omit<Facture, "id"> & { id_facture: string };
type LigneFactureWire = Omit<LigneFacture, "id"> & { id_ligne: string };
type FactureDetailWire = Omit<FactureDetail, "id" | "lignes"> & {
	id_facture: string;
	lignes: LigneFactureWire[];
};

/** Réponse de `POST /facturation/prestations/{id}/facturer`. */
export interface ResultatFacturation {
	id_facture: string;
	numero: string;
	id_paiement: string;
}

/** Appels API du module Facturation — factures. */
export function listFactures(): Promise<Facture[]> {
	// Le param `recherche` est ignoré par le backend → filtrage côté client.
	return getApiClient()
		.apiFetch<FactureWire[]>("/api/v1/facturation/factures")
		.then((data) =>
			data.map(({ id_facture: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'une facture (facture + lignes). */
export function getFacture(id: string): Promise<FactureDetail> {
	return getApiClient()
		.apiFetch<FactureDetailWire>(`/api/v1/facturation/factures/${id}`)
		.then(({ id_facture: idFacture, lignes, ...reste }) => ({
			id: idFacture,
			...reste,
			lignes: lignes.map(({ id_ligne: idLigne, ...resteLigne }) => ({
				id: idLigne,
				...resteLigne,
			})),
		}));
}

/** Corps saisi par le formulaire de facturation ponctuelle. */
export interface FacturerBody {
	montant: string;
	idMoyen: string;
	idClient?: string | null;
	remise?: string | null;
}

/**
 * Facture une prestation (la prestation devient la ligne de la facture ;
 * `montant` = montant payé immédiatement, d'où un éventuel reste).
 */
export function facturerPrestation(
	idPrestation: string,
	body: FacturerBody,
): Promise<ResultatFacturation> {
	const corps = {
		montant: body.montant,
		id_moyen: body.idMoyen,
		...(body.idClient ? { id_client: body.idClient } : {}),
		...(body.remise ? { remise: body.remise } : {}),
	} satisfies Omit<FacturerPrestationDto, "id_client" | "remise"> & {
		id_client?: string | null;
		remise?: string | null;
	};
	return getApiClient().apiFetch(
		`/api/v1/facturation/prestations/${idPrestation}/facturer`,
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
}

/** Enregistre un paiement sur une facture (`id_facture`). */
export function creerPaiementFacture(
	idFacture: string,
	body: { montant: string; idMoyen: string },
): Promise<unknown> {
	const corps = {
		montant: body.montant,
		id_moyen: body.idMoyen,
		id_facture: idFacture,
	} satisfies CreerPaiementDto;
	return getApiClient().apiFetch("/api/v1/finances/paiements", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
