import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { EcheanceSuivi } from "../models/echeances";

type EncaisserLoyerDto = components["schemas"]["EncaisserLoyerDto"];

/**
 * Appels API du module Résidence — suivi des échéances.
 *
 * `GET /residence/suivi` (params `du`/`au`/`statut` optionnels) expose les
 * échéances consolidées SANS id d'échéance (pas d'encaissement direct depuis
 * ce listing) ; l'encaissement passe par `POST /echeances/{id}/encaisser` avec
 * un `id_echeance` issu du détail du contrat.
 */
export function listEcheances(filtres?: {
	statut?: string;
	du?: string;
	au?: string;
}): Promise<EcheanceSuivi[]> {
	const params = new URLSearchParams();
	if (filtres?.statut) params.set("statut", filtres.statut);
	if (filtres?.du) params.set("du", filtres.du);
	if (filtres?.au) params.set("au", filtres.au);
	const qs = params.toString();
	return getApiClient()..apiFetch<EcheanceSuivi[]>(
		`/residence/suivi${qs ? `?${qs}` : ""}`,
	);
}

/** Corps saisi pour encaisser une échéance. */
export interface EncaisserBody {
	montant: string;
	idMoyen: string;
	date?: string;
}

/** Encaisser une échéance (POST `EncaisserLoyerDto`). */
export function encaisserEcheance(
	id: string,
	body: EncaisserBody,
): Promise<unknown> {
	const corps = {
		montant: body.montant,
		id_moyen: body.idMoyen,
		...(body.date ? { date: body.date } : {}),
	} satisfies EncaisserLoyerDto;
	return getApiClient().apiFetch(`/api/v1/residence/echeances/${id}/encaisser`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
