import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Pointage } from "../models/pointages";

type PointerArriveeDto = components["schemas"]["PointerArriveeDto"];

type PointageWire = Omit<Pointage, "id"> & { id_pointage: string };

const remapper = ({ id_pointage: id, ...reste }: PointageWire): Pointage => ({
	id,
	...reste,
});

/** Appels API du module RH — pointages. */
export function listPointages(filtres?: {
	du?: string;
	au?: string;
}): Promise<Pointage[]> {
	const params = new URLSearchParams();
	if (filtres?.du) params.set("du", filtres.du);
	if (filtres?.au) params.set("au", filtres.au);
	const qs = params.toString();
	return getApiClient()
		.apiFetch<PointageWire[]>(`/rh/pointages${qs ? `?${qs}` : ""}`)
		.then((data) => data.map(remapper));
}

/** Pointe l'arrivée d'un employé (POST `PointerArriveeDto`, heure auto). */
export function pointerArrivee(body: {
	idEmploye: string;
	date: string;
}): Promise<Pointage> {
	const corps = {
		id_employe: body.idEmploye,
		date: body.date,
		statut: "PRESENT",
	} satisfies PointerArriveeDto;
	return getApiClient()
		.apiFetch<PointageWire>("/rh/pointages", {
			method: "POST",
			body: JSON.stringify(corps),
		})
		.then(remapper);
}

/** Pointe le départ d'un pointage (POST `/pointages/{id}/depart`). */
export function pointerDepart(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/rh/pointages/${id}/depart`, {
		method: "POST",
	});
}

/** Modifie un pointage (PATCH `MajPointageDto`, champs définis seulement). */
export function modifierPointage(
	id: string,
	corps: {
		heureArrivee?: string;
		heureDepart?: string;
		dureeTravaillee?: string;
		statut?: string;
		heuresSup?: string | null;
		note?: string | null;
	},
): Promise<unknown> {
	const payload: Record<string, string> = {};
	if (corps.heureArrivee !== undefined)
		payload.heure_arrivee = corps.heureArrivee;
	if (corps.heureDepart !== undefined) payload.heure_depart = corps.heureDepart;
	if (corps.dureeTravaillee !== undefined)
		payload.duree_travaillee = corps.dureeTravaillee;
	if (corps.statut !== undefined) payload.statut = corps.statut;
	if (corps.heuresSup !== undefined) payload.heures_sup = corps.heuresSup ?? "";
	if (corps.note !== undefined) payload.note = corps.note ?? "";
	return getApiClient().apiFetch(`/api/v1/rh/pointages/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}
