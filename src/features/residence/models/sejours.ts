/**
 * Séjour court (nuitée / sieste) — utilisé comme historique d'occupation d'un
 * logement (module M2.2). Types hand-typed revalidés sur le backend réel
 * (GET /residence/sejours). Clé primaire wire `id_sejour` → `id`.
 */
export type SejourType = "NUITEE" | "SIESTE";

export type SejourStatut = "EN_COURS" | "TERMINE" | "ANNULE";

export interface Sejour {
	id: string;
	type_prestation: SejourType;
	id_client: string | null;
	id_logement: string;
	date_heure_arrivee: string;
	date_heure_depart_prevue: string | null;
	date_heure_depart_reelle: string | null;
	duree: string | null;
	tarif: string;
	montant_total: string;
	montant_paye: string;
	reste_a_payer: string;
	id_moyen_paiement: string | null;
	statut: SejourStatut;
	numero_logement: string;
	client_nom: string | null;
	client_prenoms: string | null;
}

/** Libellés français des types de prestation. */
export const SEJOUR_TYPE_LABELS: Record<SejourType, string> = {
	NUITEE: "Nuitée",
	SIESTE: "Sieste",
};

/** Libellés français du statut de séjour. */
export const SEJOUR_STATUT_LABELS: Record<SejourStatut, string> = {
	EN_COURS: "En cours",
	TERMINE: "Terminé",
	ANNULE: "Annulé",
};

/** Valeurs du filtre « Type » (URL : `?type=`). */
export type SejourTypeFiltre = "tous" | SejourType;

/** Valeurs du filtre « Statut » (URL : `?statut=`). */
export type SejourStatutFiltre = "tous" | SejourStatut;

/** Filtres de la liste des séjours (URL + côté client). */
export interface SejourFiltres {
	type: SejourTypeFiltre;
	statut: SejourStatutFiltre;
	du: string;
	au: string;
}

/**
 * Filtre la liste. Type, statut et période (comparaison lexicographique sur le
 * jour d'arrivée `date_heure_arrivee` au format `YYYY-MM-DD HH:MM:SS`).
 * Fonction pure, sans dépendance React.
 */
export function filtrerSejours(
	sejours: readonly Sejour[],
	filtres: SejourFiltres,
): Sejour[] {
	return sejours.filter((sejour) => {
		if (filtres.type !== "tous" && sejour.type_prestation !== filtres.type) {
			return false;
		}
		if (filtres.statut !== "tous" && sejour.statut !== filtres.statut) {
			return false;
		}
		const jour = sejour.date_heure_arrivee.slice(0, 10);
		if (filtres.du && jour < filtres.du) return false;
		if (filtres.au && jour > filtres.au) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageSejours {
	items: Sejour[];
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
export function paginerSejours(
	sejours: readonly Sejour[],
	page: number,
	pageSize: number,
): PageSejours {
	const total = sejours.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = sejours.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
