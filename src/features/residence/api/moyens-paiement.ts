import { getApiClient } from "#/core/api";

import type { MoyenPaiement } from "../models/moyens-paiement";

type MoyenPaiementWire = Omit<MoyenPaiement, "id"> & { id_moyen: string };

/**
 * Moyens de paiement (module Finances, partagé par les encaissements). Réponse
 * hand-typed revalidée sur le backend réel : la clé primaire wire est
 * `id_moyen` (pas `id_moyen_paiement`) → remappée en `id`.
 */
export function listMoyensPaiement(): Promise<MoyenPaiement[]> {
	return getApiClient()
		.apiFetch<MoyenPaiementWire[]>("/api/v1/finances/moyens-paiement")
		.then((data) =>
			data.map(({ id_moyen: id, ...reste }) => ({ id, ...reste })),
		);
}
