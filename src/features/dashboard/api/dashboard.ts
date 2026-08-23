import { getApiClient } from "#/core/api";

export interface SyntheseGlobale {
	calcule_le: string;
	residence: {
		chambres_occupees: number;
		chambres_disponibles: number;
		recettes_mois: number | string;
		impayes: { nombre: number; montant: number | string };
		reservations_en_attente: number;
	};
	market: {
		nombre_ventes_aujourd_hui: number;
		chiffre_affaires_aujourd_hui: number | string;
		stock: {
			total_produits: number;
			valeur_stock: number | string;
			en_alerte: number;
			alertes: Array<{
				id_produit: string;
				nom: string;
				quantite_stock: number | string;
				seuil_alerte: number | string;
			}>;
		};
	};
	pressing: {
		commandes_en_cours: number;
		commandes_pretes: number;
		commandes_retirees_aujourd_hui: number;
		chiffre_affaires_mois: number | string;
	};
	restaurant: {
		nombre_commandes_aujourd_hui: number;
		chiffre_affaires_aujourd_hui: number | string;
	};
	salle_fete: {
		reservations_a_venir: number;
		prochaines: Array<{
			id_reservation: string;
			date_evenement: string;
			type_manifestation: string;
			client: string;
			statut: string;
		}>;
		recettes_mois: number | string;
	};
	personnel: {
		presents_aujourd_hui: number;
		absents_aujourd_hui: number;
		retards_aujourd_hui: number;
		total_pointages_aujourd_hui: number;
	};
	finances: {
		recettes_jour: number | string;
		depenses_mois: number | string;
		salaires_a_payer_mois: number | string;
		solde_mois: number | string;
		chiffre_affaires_global_mois: number | string;
	};
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
	id_reservation?: string;
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

/** Récupère les réservations de la salle de fête (sans filtre de période) */
export function getReservationsSalleFutures(): Promise<Reservation[]> {
	const url = `/salle-fete/reservations?limit=10`;
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
