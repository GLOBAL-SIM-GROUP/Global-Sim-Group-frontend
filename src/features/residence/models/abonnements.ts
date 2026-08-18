/**
 * Abonnement souscrit par un résident à un service (module M2.4). Types
 * hand-typed revalidés sur le backend réel (GET /residence/abonnements). Clé
 * primaire wire `id_abonnement` → `id` ; le lister embarque déjà `client_nom`,
 * `client_prenoms` et `numero_logement`.
 */
export type AbonnementType = "MENSUEL" | "ANNUEL" | "PERIODIQUE";

export type AbonnementStatut = "ACTIF" | "SUSPENDU" | "RESILIE" | "EXPIRE";

export interface Abonnement {
	id: string;
	id_client: string;
	id_logement: string | null;
	service: string;
	type: AbonnementType;
	montant: string;
	date_debut: string;
	date_fin: string | null;
	montant_paye: string;
	statut: AbonnementStatut;
	client_nom: string;
	client_prenoms: string;
	numero_logement: string | null;
}

/** Libellés français du type d'abonnement. */
export const ABONNEMENT_TYPE_LABELS: Record<AbonnementType, string> = {
	MENSUEL: "Mensuel",
	ANNUEL: "Annuel",
	PERIODIQUE: "Périodique",
};

/** Libellés français du statut d'abonnement. */
export const ABONNEMENT_STATUT_LABELS: Record<AbonnementStatut, string> = {
	ACTIF: "Actif",
	SUSPENDU: "Suspendu",
	RESILIE: "Résilié",
	EXPIRE: "Expiré",
};

/** Valeurs du filtre « Statut » (URL : `?statut=`). */
export type AbonnementStatutFiltre = "tous" | AbonnementStatut;

/** Filtres de la liste des abonnements (URL + côté client). */
export interface AbonnementFiltres {
	statut: AbonnementStatutFiltre;
	locataire: string;
	service: string;
}

/**
 * Filtre la liste. Statut + textes « locataire » (nom complet) et « service ».
 * Fonction pure, sans dépendance React.
 */
export function filtrerAbonnements(
	abonnements: readonly Abonnement[],
	filtres: AbonnementFiltres,
): Abonnement[] {
	return abonnements.filter((abonnement) => {
		if (filtres.statut !== "tous" && abonnement.statut !== filtres.statut) {
			return false;
		}
		const nom = `${abonnement.client_nom} ${abonnement.client_prenoms}`.trim();
		if (
			filtres.locataire &&
			!nom.toLowerCase().includes(filtres.locataire.toLowerCase())
		) {
			return false;
		}
		if (
			filtres.service &&
			!abonnement.service.toLowerCase().includes(filtres.service.toLowerCase())
		) {
			return false;
		}
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageAbonnements {
	items: Abonnement[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/**
 * Pagination client (le lister ne documente aucune pagination serveur).
 * Page bornée à [1, totalPages].
 */
export function paginerAbonnements(
	abonnements: readonly Abonnement[],
	page: number,
	pageSize: number,
): PageAbonnements {
	const total = abonnements.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = abonnements.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
