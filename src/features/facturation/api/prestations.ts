import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Prestation } from "../models/prestations";

type CreerPrestationDto = components["schemas"]["CreerPrestationDto"];
type MajPrestationDto = components["schemas"]["MajPrestationDto"];

/**
 * Le schéma généré type `categorie`/api/v1/`description`/api/v1/`id_activite` en objet libre
 * (`Record<string, never> | null`) mais ce sont de vraies valeurs ; on élargit.
 */
type PrestationWire = Omit<Prestation, "id"> & { id_prestation: string };

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/** Appels API du module Facturation — prestations. */
export function listPrestations(): Promise<Prestation[]> {
	return getApiClient()
		.apiFetch<PrestationWire[]>("/facturation/prestations")
		.then((data) =>
			data.map(({ id_prestation: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Corps saisi par le formulaire prestation. */
export interface PrestationBody {
	libelle: string;
	categorie?: string | null;
	prix: string;
	description?: string | null;
	idActivite?: string | null;
	actif?: boolean;
}

/** Crée une prestation (POST `CreerPrestationDto`). */
export function creerPrestation(body: PrestationBody): Promise<unknown> {
	const corps = {
		libelle: body.libelle,
		categorie: texteOuNull(body.categorie),
		prix: body.prix,
		description: texteOuNull(body.description),
		id_activite: texteOuNull(body.idActivite),
		actif: body.actif ?? true,
	} satisfies Omit<
		CreerPrestationDto,
		"categorie" | "description" | "id_activite"
	> & {
		categorie?: string | null;
		description?: string | null;
		id_activite?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/facturation/prestations", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie une prestation (PATCH `MajPrestationDto`). */
export function modifierPrestation(
	id: string,
	body: PrestationBody,
): Promise<unknown> {
	const corps = {
		libelle: body.libelle,
		categorie: texteOuNull(body.categorie),
		prix: body.prix,
		description: texteOuNull(body.description),
		id_activite: texteOuNull(body.idActivite),
		actif: body.actif ?? true,
	} satisfies Omit<
		MajPrestationDto,
		"categorie" | "description" | "id_activite"
	> & {
		categorie?: string | null;
		description?: string | null;
		id_activite?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/facturation/prestations/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}
