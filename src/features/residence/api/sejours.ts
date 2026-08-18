import { getApiClient } from "#/core/api";

import type { Sejour } from "../models/sejours";

type SejourWire = Omit<Sejour, "id"> & { id_sejour: string };

/**
 * Appels API du module Résidence — séjours courts. Réponse hand-typed revalidée
 * sur le backend réel. Les 4 params du lister sont marqués `required` à tort
 * (cf. docs/api.md) : appelé sans params — à revalider au smoke test réel.
 */
export function listSejours(): Promise<Sejour[]> {
	return getApiClient()
		.apiFetch<SejourWire[]>("/residence/sejours")
		.then((data) =>
			data.map(({ id_sejour: id, ...reste }) => ({ id, ...reste })),
		);
}
