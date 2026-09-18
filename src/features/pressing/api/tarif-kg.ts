import { getApiClient, toApiError } from "#/core/api";

import type { TarifKg } from "../models/tarif-kg";

type TarifKgWire = Omit<TarifKg, "id"> & { id_tarif_kg: string };

const toTarifKg = ({ id_tarif_kg: id, ...reste }: TarifKgWire): TarifKg => ({
	id,
	...reste,
});

/**
 * Tarif au kilo courant (`GET /pressing/tarif-kg`, permission
 * `PRESSING.GERER_TARIFS`) — `null` si aucun tarif n'a jamais été configuré
 * (état normal avant la première utilisation du mode `POIDS`, pas une
 * erreur : le backend renvoie soit un corps vide, soit un 404 selon les cas,
 * les deux sont traités pareil ici).
 */
export async function getTarifKg(): Promise<TarifKg | null> {
	try {
		const wire = await getApiClient().apiFetch<TarifKgWire | null>(
			"/api/v1/pressing/tarif-kg",
		);
		return wire ? toTarifKg(wire) : null;
	} catch (error) {
		if (toApiError(error).status === 404) return null;
		throw error;
	}
}

/**
 * Ajoute un nouveau tarif au kilo courant (`POST /pressing/tarif-kg`,
 * permission `PRESSING.GERER_TARIFS`). Append-only — pas de mise à jour ni
 * de suppression : les commandes déjà créées gardent leur total, calculé
 * avec le tarif en vigueur au moment de leur création/modification.
 */
export function definirTarifKg(prixKg: string): Promise<TarifKg> {
	return getApiClient()
		.apiFetch<TarifKgWire>("/api/v1/pressing/tarif-kg", {
			method: "POST",
			body: JSON.stringify({ prix_kg: prixKg }),
		})
		.then(toTarifKg);
}
