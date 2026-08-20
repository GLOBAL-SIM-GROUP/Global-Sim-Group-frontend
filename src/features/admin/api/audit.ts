import { getApiClient } from "#/core/api";

import type { TraceAudit } from "../models/audit";

type TraceAuditWire = Omit<TraceAudit, "id"> & { id_trace: string };

/** Appels API du module Administration — journal d'audit. */
export function listJournal(filtres?: {
	du?: string;
	au?: string;
	module?: string;
	utilisateur?: string;
	recherche?: string;
}): Promise<TraceAudit[]> {
	const params = new URLSearchParams();
	if (filtres?.du) params.set("du", filtres.du);
	if (filtres?.au) params.set("au", filtres.au);
	if (filtres?.module && filtres.module !== "tous")
		params.set("module", filtres.module);
	if (filtres?.utilisateur && filtres.utilisateur !== "tous")
		params.set("utilisateur", filtres.utilisateur);
	if (filtres?.recherche?.trim())
		params.set("recherche", filtres.recherche.trim());
	const qs = params.toString();
	return getApiClient()
		.apiFetch<TraceAuditWire[]>(`/audit/journal${qs ? `?${qs}` : ""}`)
		.then((data) =>
			data.map(({ id_trace: id, ...reste }) => ({ id, ...reste })),
		);
}
