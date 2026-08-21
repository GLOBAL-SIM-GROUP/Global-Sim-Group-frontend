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
export function getSyntheseGlobale(du?: string, au?: string): Promise<SyntheseGlobale> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/rapports/synthese-globale?${qs}` : "/rapports/synthese-globale";
	return getApiClient().apiFetch<SyntheseGlobale>(url);
}

/** Récupère les indicateurs pour une activité spécifique */
export function getIndicateurActivite(code: string): Promise<IndicateurActivite> {
	return getApiClient().apiFetch<IndicateurActivite>(
		`/rapports/activites/${code}`,
	);
}

/** Récupère les logements (tous) - filtre côté client par statut */
export function getLogementsDispo(du?: string, au?: string): Promise<Logement[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/residence/logements?${qs}` : "/residence/logements";
	return getApiClient()
		.apiFetch<Array<{ id_logement: string; statut: string; numero: string; id_batiment: string }>>(url)
		.then((logements) =>
			logements
				.filter((l) => l.statut === "disponible")
				.map((l) => ({
					id_logement: l.id_logement,
					numero: l.numero,
					statut: l.statut,
					id_batiment: l.id_batiment,
				})),
		)
		.catch(() => []);
}

/** Récupère les produits avec stock faible */
export function getProduitsCritiques(du?: string, au?: string): Promise<Produit[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/market/produits?${qs}` : "/market/produits";
	return getApiClient()
		.apiFetch<Array<{ id_produit: string; nom: string; stock: number | string; prix: number | string }>>(url)
		.then((produits) =>
			produits.filter((p) => Number(p.stock) < 10),
		)
		.catch(() => []);
}

/** Récupère les commandes au pressing (en cours) */
export function getCommandesPressing(du?: string, au?: string): Promise<CommandePressing[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/pressing/commandes?${qs}` : "/pressing/commandes";
	return getApiClient()
		.apiFetch<Array<{ id_commande: string; statut: string; date_depot: string; date_retrait?: string }>>(url)
		.then((commandes) =>
			// Filtre côté client: exclude les retraitées et annulées
			commandes.filter((c) => c.statut !== "RETIREE" && c.statut !== "ANNULEE"),
		)
		.catch(() => []);
}

/** Récupère les réservations de la salle de fête */
export function getReservationsSalle(du?: string, au?: string): Promise<Reservation[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/salle-fete/reservations?${qs}` : "/salle-fete/reservations";
	return getApiClient()
		.apiFetch<Reservation[]>(url)
		.then((reservations) =>
			reservations
				.filter((r) => new Date(r.date) >= new Date())
				.slice(0, 5),
		)
		.catch(() => []);
}

/** Récupère les pointages */
export function getPointagesAujourdhui(du?: string, au?: string): Promise<Pointage[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/rh/pointages?${qs}` : "/rh/pointages";
	return getApiClient()
		.apiFetch<Pointage[]>(url)
		.catch(() => []);
}

/** Récupère les impayés */
export function getImpayes(du?: string, au?: string): Promise<Impaye[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/finances/impayes?${qs}` : "/finances/impayes";
	return getApiClient()
		.apiFetch<Impaye[]>(url)
		.catch(() => []);
}
