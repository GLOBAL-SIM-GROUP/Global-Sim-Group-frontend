import { getApiClient } from "#/core/api";
import { imprimerPdfBlob } from "#/lib/print-pdf";

import type { TraceAudit } from "../models/audit";

/**
 * `apres` est absent du spec généré (schema gap, même famille que d'autres
 * champs déjà rencontrés dans ce projet) mais bien renvoyé par le backend —
 * vérifié en direct le 2026-09-06.
 */
type TraceAuditWire = Omit<TraceAudit, "id" | "apres"> & {
	id_trace: string;
	apres?: string | null;
};

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
		.apiFetch<TraceAuditWire[]>(`/api/v1/audit/journal${qs ? `?${qs}` : ""}`)
		.then((data) =>
			data.map(({ id_trace: id, apres, ...reste }) => ({
				id,
				apres: apres ?? null,
				...reste,
			})),
		);
}

/**
 * Chemin du rapport backend (`GET /audit/journal?format=pdf|xlsx`) — déjà
 * pleinement implémenté côté backend (graphiques, cartes de stats, tableau
 * détaillé), il ne manquait qu'un point d'entrée frontend. Reprend les mêmes
 * filtres que `listJournal` pour imprimer/exporter exactement la vue
 * actuellement affichée.
 */
export function getJournalExportPath(
	format: "pdf" | "xlsx",
	params?: ListJournalParams,
): string {
	const searchParams = new URLSearchParams();
	searchParams.set("format", format);
	if (params?.search?.trim()) searchParams.set("search", params.search.trim());
	if (params?.du) searchParams.set("du", params.du);
	if (params?.au) searchParams.set("au", params.au);
	if (params?.module && params.module !== "tous")
		searchParams.set("module", params.module);
	if (params?.utilisateur && params.utilisateur !== "tous")
		searchParams.set("utilisateur", params.utilisateur);
	return `/api/v1/audit/journal?${searchParams.toString()}`;
}

/** Imprime le rapport PDF du journal (généré côté backend). */
export async function imprimerJournalPdf(chemin: string): Promise<void> {
	const blob = await getApiClient().download(chemin);
	imprimerPdfBlob(blob);
}

/** Télécharge le rapport Excel du journal (généré côté backend). */
export async function telechargerJournalExcel(
	chemin: string,
	nomFichier: string,
): Promise<void> {
	const blob = await getApiClient().download(chemin);
	const url = URL.createObjectURL(blob);
	const lien = document.createElement("a");
	lien.href = url;
	lien.download = nomFichier;
	document.body.appendChild(lien);
	lien.click();
	document.body.removeChild(lien);
	URL.revokeObjectURL(url);
}
