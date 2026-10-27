import { getApiClient } from "#/core/api";
import { trierAlpha } from "#/lib/tri";

import type { ServiceRh } from "../models/services";

type ServiceRhWire = Omit<ServiceRh, "id"> & { id_service: string };

/** Appels API du module RH — services. */
export function listServices(): Promise<ServiceRh[]> {
	return getApiClient()
		.apiFetch<ServiceRhWire[]>("/api/v1/rh/services")
		.then((data) =>
			trierAlpha(
				data.map(({ id_service: id, ...reste }) => ({ id, ...reste })),
				(s) => s.libelle,
			),
		);
}
