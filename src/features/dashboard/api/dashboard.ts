import { getApiClient } from "#/core/api";

/**
 * Réponse réelle de `GET /rapports/synthese-globale` (revalidée en direct le
 * 2026-08-28 avec un token admin — le spec `/docs-json` ne documente pas cet
 * endpoint). Structure plate, pas de sous-objets par module métier.
 */
export interface SyntheseGlobale {
	periode: { du: string | null; au: string | null };
	recettes_par_activite: Array<{
		code: string;
		libelle: string;
		total_encaisse: string;
	}>;
	total_recettes: string;
	total_depenses: string;
	solde: string;
	impayes: { nombre: number; montant: string };
	masse_salariale: string;
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
	quantite_stock: number | string;
	seuil_alerte: number | string;
}

export interface CommandePressing {
	id_commande: string;
	statut: string;
	date_depot: string;
	date_retrait?: string;
}

export interface Reservation {
	id?: string;
	id_reservation?: string;
	id_client?: string | null;
	date?: string;
	date_evenement?: string;
	heure_debut?: string;
	heure_fin?: string;
	nom_client?: string;
	client?: string;
	type_manifestation?: string;
	statut: string;
}

export interface Pointage {
	id_employe: string;
	employe_nom: string;
	employe_prenom: string;
	statut: string;
	heure_arrivee?: string | null;
	heure_depart?: string | null;
}

export interface Impaye {
	id?: string;
	locataire: string;
	montant: number | string;
	date_echeance: string;
	statut: string;
}

/** Récupère la synthèse globale du tableau de bord */
export function getSyntheseGlobale(
	du?: string,
	au?: string,
): Promise<SyntheseGlobale> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs
		? `/api/v1/rapports/synthese-globale?${qs}`
		: "/api/v1/rapports/synthese-globale";
	return getApiClient().apiFetch<SyntheseGlobale>(url);
}

/** Récupère les réservations de la salle de fête (sans filtre de période) */
export function getReservationsSalleFutures(): Promise<Reservation[]> {
	const url = `/api/v1/salle-fete/reservations?limit=10`;
	return getApiClient()
		.apiFetch<Reservation[]>(url)
		.then((reservations) =>
			reservations
				.filter((r) => {
					const date = r.date_evenement || r.date;
					return date && new Date(date) >= new Date();
				})
				.sort((a, b) => {
					const dateA = a.date_evenement || a.date || "";
					const dateB = b.date_evenement || b.date || "";
					return new Date(dateA).getTime() - new Date(dateB).getTime();
				})
				.slice(0, 5),
		)
		.catch(() => []);
}

/** Récupère les indicateurs pour une activité spécifique */
export function getIndicateurActivite(
	code: string,
): Promise<IndicateurActivite> {
	return getApiClient().apiFetch<IndicateurActivite>(
		`/api/v1/rapports/activites/${code}`,
	);
}

/** Récupère les logements (tous) - filtre côté client par statut */
export function getLogementsDispo(
	du?: string,
	au?: string,
): Promise<Logement[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs
		? `/api/v1/residence/logements?${qs}`
		: "/api/v1/residence/logements";
	return getApiClient()
		.apiFetch<
			Array<{
				id_logement: string;
				statut: string;
				numero: string;
				id_batiment: string;
			}>
		>(url)
		.then((logements) =>
			logements
				.filter((l) => l.statut === "DISPONIBLE")
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
export function getProduitsCritiques(
	du?: string,
	au?: string,
): Promise<Produit[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/api/v1/market/produits?${qs}` : "/api/v1/market/produits";
	return getApiClient()
		.apiFetch<
			Array<{
				id_produit: string;
				nom: string;
				quantite_stock: number | string;
				seuil_alerte: number | string;
			}>
		>(url)
		.then((produits) =>
			produits.filter(
				(p) => Number(p.quantite_stock) <= Number(p.seuil_alerte),
			),
		)
		.catch(() => []);
}

/** Récupère les commandes au pressing (en cours) */
export function getCommandesPressing(
	du?: string,
	au?: string,
): Promise<CommandePressing[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs
		? `/api/v1/pressing/commandes?${qs}`
		: "/api/v1/pressing/commandes";
	return getApiClient()
		.apiFetch<
			Array<{
				id_commande: string;
				statut: string;
				date_depot: string;
				date_retrait?: string;
			}>
		>(url)
		.then((commandes) =>
			// Filtre côté client: exclude les retraitées et annulées
			commandes.filter((c) => c.statut !== "RETIREE" && c.statut !== "ANNULEE"),
		)
		.catch(() => []);
}

/** Récupère les pointages */
export function getPointagesAujourdhui(
	du?: string,
	au?: string,
): Promise<Pointage[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	const url = qs ? `/api/v1/rh/pointages?${qs}` : "/api/v1/rh/pointages";
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
	const url = qs
		? `/api/v1/finances/impayes?${qs}`
		: "/api/v1/finances/impayes";
	return getApiClient()
		.apiFetch<Impaye[]>(url)
		.catch(() => []);
}
