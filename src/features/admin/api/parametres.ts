import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Parametre } from "../models/parametres";

type MajParametreDto = components["schemas"]["MajParametreDto"];

type ParametreWire = Omit<Parametre, "id"> & { id_parametre: string };

/** Appels API du module Administration — paramètres généraux (CORE). */
export function listParametres(): Promise<Parametre[]> {
	return getApiClient()
		.apiFetch<ParametreWire[]>("/core/parametres")
		.then((data) =>
			data.map(({ id_parametre: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Met à jour la valeur d'un paramètre (PUT `MajParametreDto`). */
export function majParametre(cle: string, valeur: string): Promise<unknown> {
	const corps = { valeur } satisfies MajParametreDto;
	return getApiClient().apiFetch(`/api/v1/core/parametres/${cle}`, {
		method: "PUT",
		body: JSON.stringify(corps),
	});
}
