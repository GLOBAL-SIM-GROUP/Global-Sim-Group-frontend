import { getApiClient } from "#/core/api";

import type { ServiceRh } from "../models/services";

type ServiceRhWire = Omit<ServiceRh, "id"> & { id_service: string };

/** Appels API du module RH — services. */
export function listServices(): Promise<ServiceRh[]> {
	return getApiClient()
		.apiFetch<ServiceRhWire[]>("/rh/services")
		.then((data) =>
			data.map(({ id_service: id, ...reste }) => ({ id, ...reste })),
		);
}
