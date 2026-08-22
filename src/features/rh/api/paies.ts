import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { ElementPaie, Paie, PaieDetail } from "../models/paies";

type CreerPaieDto = components["schemas"]["CreerPaieDto"];
type AjouterElementSalaireDto =
	components["schemas"]["AjouterElementSalaireDto"];
type PayerPaieDto = components["schemas"]["PayerPaieDto"];

type PaieWire = Omit<Paie, "id"> & { id_paie: string };
type ElementPaieWire = Omit<ElementPaie, "id"> & { id_element: string };

/** Appels API du module RH — bulletins de salaire (paies). */
export function listPaies(): Promise<Paie[]> {
	return getApiClient()
		.apiFetch<PaieWire[]>("/rh/paies")
		.then((data) =>
			data.map(({ id_paie: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'un bulletin : paie + éléments. */
export function getPaie(id: string): Promise<PaieDetail> {
	return getApiClient()
		.apiFetch<{ paie: PaieWire; elements: ElementPaieWire[] }>(
			`/rh/paies/${id}`,
		)
		.then(({ paie: paieWire, elements }) => {
			const { id_paie, ...reste } = paieWire;
			return {
				paie: { id: id_paie, ...reste },
				elements: elements.map(
					({ id_element: idElement, ...resteElement }) => ({
						id: idElement,
						...resteElement,
					}),
				),
			};
		});
}

/** Crée un bulletin (POST `CreerPaieDto`, statut CALCULÉE). */
export function creerPaie(body: {
	idEmploye: string;
	periode: string;
	salaireBase: string;
}): Promise<{ id_paie: string }> {
	const corps = {
		id_employe: body.idEmploye,
		periode: body.periode,
		salaire_base: body.salaireBase,
	} satisfies CreerPaieDto;
	return getApiClient().apiFetch("/api/v1/rh/paies", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Ajoute un élément de salaire au bulletin. */
export function ajouterElementPaie(
	id: string,
	body: { type: string; libelle: string; montant: string },
): Promise<unknown> {
	const corps = {
		type: body.type as AjouterElementSalaireDto["type"],
		libelle: body.libelle,
		montant: body.montant,
	} satisfies AjouterElementSalaireDto;
	return getApiClient().apiFetch(`/api/v1/rh/paies/${id}/elements`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Recalcule le bulletin (totaux et montant à payer). */
export function recalculerPaie(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/rh/paies/${id}/recalculer`, {
		method: "POST",
	});
}

/** Valide un bulletin (PATCH, statut VALIDÉE). */
export function validerPaie(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/rh/paies/${id}/valider`, {
		method: "PATCH",
	});
}

/** Annule un bulletin. */
export function annulerPaie(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/rh/paies/${id}/annuler`, {
		method: "POST",
	});
}

/** Paye un bulletin (crée l'encaissement, statut PAYÉE). */
export function payerPaie(id: string, idMoyen: string): Promise<unknown> {
	const corps = { id_moyen: idMoyen } satisfies PayerPaieDto;
	return getApiClient().apiFetch(`/api/v1/rh/paies/${id}/payer`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
