import { getApiClient } from "#/core/api";

export interface SyntheseGlobale {
	periode: string;
	recettes_par_activite: Array<{
		code: string;
		libelle: string;
		total_encaisse: number | string;
	}>;
	total_recettes: number | string;
	total_depenses: number | string;
	solde: number | string;
	impayes: {
		nombre: number;
		montant: number | string;
	};
	masse_salariale: number | string;
}

export interface IndicateurActivite {
	code: string;
	libelle: string;
	recettes: number | string;
	nombre_operations: number;
	indicateurs: Record<string, unknown>;
}

/** Récupère la synthèse globale du tableau de bord */
export function getSyntheseGlobale(): Promise<SyntheseGlobale> {
	return getApiClient().apiFetch<SyntheseGlobale>(
		"/rapports/synthese-globale",
	);
}

/** Récupère les indicateurs pour une activité spécifique */
export function getIndicateurActivite(code: string): Promise<IndicateurActivite> {
	return getApiClient().apiFetch<IndicateurActivite>(
		`/rapports/activites/${code}`,
	);
}
