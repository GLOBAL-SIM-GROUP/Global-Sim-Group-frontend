import { getApiClient } from "#/core/api";

import type { TraceAudit } from "../models/audit";

type TraceAuditWire = Omit<TraceAudit, "id"> & { id_trace: string };

export interface ListJournalParams {
	search?: string;
	du?: string;
	au?: string;
	module?: string;
	utilisateur?: string;
}

/** Appels API du module Administration — journal d'audit. */
export function listJournal(params?: ListJournalParams): Promise<TraceAudit[]> {
	const searchParams = new URLSearchParams();
	if (params?.search?.trim()) searchParams.set("search", params.search.trim());
	if (params?.du) searchParams.set("du", params.du);
	if (params?.au) searchParams.set("au", params.au);
	if (params?.module && params.module !== "tous")
		searchParams.set("module", params.module);
	if (params?.utilisateur && params.utilisateur !== "tous")
		searchParams.set("utilisateur", params.utilisateur);
	const qs = searchParams.toString();
	return getApiClient()
		.apiFetch<TraceAuditWire[]>(`/audit/journal${qs ? `?${qs}` : ""}`)
		.then((data) =>
			data.map(({ id_trace: id, ...reste }) => ({ id, ...reste })),
		);
}
