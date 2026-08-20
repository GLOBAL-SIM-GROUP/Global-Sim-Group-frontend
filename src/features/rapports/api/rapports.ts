import { getApiClient } from "#/core/api";

import type {
	ActiviteRapport,
	RapportFinancier,
	RapportRh,
	SyntheseGlobale,
} from "../models/rapports";

function params(du: string, au: string): string {
	const query = new URLSearchParams();
	if (du) query.set("du", du);
	if (au) query.set("au", au);
	const qs = query.toString();
	return qs ? `?${qs}` : "";
}

/** Appels API du module Rapports. */
export function getSyntheseGlobale(
	du: string,
	au: string,
): Promise<SyntheseGlobale> {
	return getApiClient().apiFetch(`/rapports/synthese-globale${params(du, au)}`);
}

export function getRapportFinancier(
	du: string,
	au: string,
): Promise<RapportFinancier> {
	return getApiClient().apiFetch(`/rapports/financier${params(du, au)}`);
}

export function getRapportActivite(
	code: string,
	du: string,
	au: string,
): Promise<ActiviteRapport> {
	return getApiClient().apiFetch(
		`/rapports/activites/${code}${params(du, au)}`,
	);
}

export function getRapportRh(du: string, au: string): Promise<RapportRh> {
	return getApiClient().apiFetch(`/rapports/rh${params(du, au)}`);
}

/**
 * Chemin d'un rapport au format PDF (`GET &format=pdf`). Le backend peut encore
 * renvoyer une 500 sur ce format — l'appelant affiche l'erreur.
 */
export function rapportPdfPath(base: string, du: string, au: string): string {
	const query = new URLSearchParams();
	if (du) query.set("du", du);
	if (au) query.set("au", au);
	query.set("format", "pdf");
	return `${base}?${query.toString()}`;
}
