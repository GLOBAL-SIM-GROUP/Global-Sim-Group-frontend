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

/** Récupère les cinq prochaines réservations de la salle de fête. */
export function getReservationsSalleFutures(): Promise<Reservation[]> {
	const aujourdhui = new Date().toISOString().slice(0, 10);
	const params = new URLSearchParams({
		du: aujourdhui,
		sort: "date_evenement",
		order: "asc",
		limit: "5",
	});
	return getApiClient()
		.apiFetch<Reservation[]>(
			`/api/v1/salle-fete/reservations?${params.toString()}`,
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

/**
 * Réponse de `GET /dashboard?activite=<code>` (nouveau module, absent du
 * spec — vérifié en direct le 2026-09-06). Résumé d'une activité sur la
 * période `du`/`au`. `indicateurs` n'a pas de forme fixe : chaque activité a
 * ses propres clés (ex. PRESSING → `par_statut`, VENTE_MARCHANDISES →
 * `top_produit`, LOCATION_RESIDENTIEL → `impayes`) — vérifié sur les 6 codes
 * réels, tous différents.
 */
export interface DashboardActivite {
	code: string;
	libelle: string;
	recettes_mois: string;
	nombre_operations_mois: number;
	indicateurs: Record<string, unknown>;
}

/** Résumé consolidé d'une activité (GET `/dashboard?activite=...`). */
export function getDashboardActivite(
	code: string,
	du?: string,
	au?: string,
): Promise<DashboardActivite> {
	const params = new URLSearchParams();
	params.set("activite", code);
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	return getApiClient().apiFetch<DashboardActivite>(
		`/api/v1/dashboard?${params.toString()}`,
	);
}

/** Chemin d'export PDF/Excel du résumé d'activité (mêmes filtres que ci-dessus). */
export function getDashboardActivitePath(
	format: "pdf" | "xlsx",
	code: string,
	du?: string,
	au?: string,
): string {
	const params = new URLSearchParams();
	params.set("format", format);
	params.set("activite", code);
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	return `/api/v1/dashboard?${params.toString()}`;
}

/** Récupère les logements disponibles, filtrés directement par le backend. */
export function getLogementsDispo(): Promise<Logement[]> {
	return getApiClient()
		.apiFetch<Logement[]>(
			"/api/v1/residence/logements?statut=DISPONIBLE&limit=200",
		)
		.catch(() => []);
}

/** Récupère les produits avec stock faible */
export function getProduitsCritiques(): Promise<Produit[]> {
	return getApiClient()
		.apiFetch<
			Array<{
				id_produit: string;
				nom: string;
				quantite_stock: number | string;
				seuil_alerte: number | string;
			}>
		>("/api/v1/market/produits?limit=200")
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
			commandes.filter((c) => c.statut !== "RETIRE" && c.statut !== "ANNULEE"),
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

/** Récupère les impayés ; la période est filtrée côté client. */
export function getImpayes(): Promise<Impaye[]> {
	return getApiClient()
		.apiFetch<Impaye[]>("/api/v1/finances/impayes")
		.catch(() => []);
}
