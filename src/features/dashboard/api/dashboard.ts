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

export interface Logement {
	id_logement: string;
	numero: string;
	statut: string;
	id_batiment: string;
}

export interface Produit {
	id_produit: string;
	nom: string;
	stock: number | string;
	prix: number | string;
}

export interface CommandePressing {
	id_commande: string;
	statut: string;
	date_depot: string;
	date_retrait?: string;
}

export interface Reservation {
	id?: string;
	date: string;
	heure_debut: string;
	heure_fin: string;
	nom_client: string;
	statut: string;
}

export interface Pointage {
	id_employe: string;
	nom: string;
	statut: string;
	heure_arrivee?: string;
	heure_depart?: string;
	retard?: boolean;
}

export interface Impaye {
	id?: string;
	locataire: string;
	montant: number | string;
	date_echeance: string;
	statut: string;
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

/** Récupère les logements disponibles */
export function getLogementsDispo(): Promise<Logement[]> {
	return getApiClient()
		.apiFetch<Array<Logement & { id_logement: string; id?: never }>>(
			"/residence/logements?statut=disponible",
		)
		.catch(() => []);
}

/** Récupère les produits avec stock faible */
export function getProduitsCritiques(): Promise<Produit[]> {
	return getApiClient()
		.apiFetch<Produit[]>("/market/produits")
		.then((produits) =>
			produits.filter((p) => Number(p.stock) < 10),
		)
		.catch(() => []);
}

/** Récupère les commandes au pressing */
export function getCommandesPressing(): Promise<CommandePressing[]> {
	return getApiClient()
		.apiFetch<CommandePressing[]>("/pressing/commandes")
		.then((commandes) =>
			commandes.filter((c) => c.statut !== "retirer"),
		)
		.catch(() => []);
}

/** Récupère les réservations de la salle de fête */
export function getReservationsSalle(): Promise<Reservation[]> {
	return getApiClient()
		.apiFetch<Reservation[]>("/salle-fete/reservations")
		.then((reservations) =>
			reservations.filter(
				(r) => new Date(r.date) >= new Date(),
			).slice(0, 5),
		)
		.catch(() => []);
}

/** Récupère les pointages du jour */
export function getPointagesAujourdhui(): Promise<Pointage[]> {
	return getApiClient()
		.apiFetch<Pointage[]>("/rh/pointages?date=aujourd_hui")
		.catch(() => []);
}

/** Récupère les impayés */
export function getImpayes(): Promise<Impaye[]> {
	return getApiClient()
		.apiFetch<Impaye[]>("/finances/impayes")
		.catch(() => []);
}
