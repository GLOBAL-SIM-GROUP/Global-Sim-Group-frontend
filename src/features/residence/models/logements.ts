/**
 * Logement de la résidence (module M2.2).
 *
 * Le spec OpenAPI ne déclare aucun schéma de réponse (cf. docs/api.md) : ce
 * type a été hand-typed puis revalidé sur le backend réel (GET
 * /residence/logements). La clé primaire wire `id_logement` est remappée en
 * `id` par la couche API ; `id_batiment` (FK) est conservé tel quel. Les id
 * bigint sont transportés en string par le backend.
 */
export type LogementType = "CHAMBRE" | "STUDIO" | "APPARTEMENT" | "MEUBLE";

export type LogementStatut =
	| "DISPONIBLE"
	| "RESERVE"
	| "OCCUPE"
	| "EN_NETTOYAGE"
	| "EN_MAINTENANCE"
	| "INDISPONIBLE";

export interface Logement {
	id: string;
	numero: string;
	nom: string | null;
	type: LogementType;
	tarif: string;
	equipements: string | null;
	statut: LogementStatut;
	etat: string | null;
	id_batiment: string;
}

/** Libellés français des types (select du formulaire, colonne du tableau). */
export const LOGEMENT_TYPE_LABELS: Record<LogementType, string> = {
	CHAMBRE: "Chambre",
	STUDIO: "Studio",
	APPARTEMENT: "Appartement",
	MEUBLE: "Meublé",
};

/** Libellés français du statut (badge du tableau). */
export const LOGEMENT_STATUT_LABELS: Record<LogementStatut, string> = {
	DISPONIBLE: "Disponible",
	RESERVE: "Réservé",
	OCCUPE: "Occupé",
	EN_NETTOYAGE: "En nettoyage",
	EN_MAINTENANCE: "En maintenance",
	INDISPONIBLE: "Indisponible",
};

/**
 * Occupation actuelle, dérivée du statut : le spec n'expose aucun nom
 * d'occupant dans la réponse du lister (aucun schéma de réponse). « Libre »
 * pour un logement disponible, sinon l'état humain du statut.
 */
export const OCCUPATION_LABELS: Record<LogementStatut, string> = {
	DISPONIBLE: "Libre",
	RESERVE: "Réservé",
	OCCUPE: "Occupé",
	EN_NETTOYAGE: "En nettoyage",
	EN_MAINTENANCE: "En maintenance",
	INDISPONIBLE: "Indisponible",
};

/** Formate un tarif FCFA (string backend) en « 35 000 FCFA ». */
export function formatTarifFCFA(tarif: string): string {
	const valeur = Number(tarif);
	if (!Number.isFinite(valeur)) return tarif;
	// `toLocaleString("fr-FR")` peut insérer une espace fine insécable (U+202F /
	// U+00A0) : on la normalise en espace simple pour un affichage stable.
	const formate = valeur.toLocaleString("fr-FR");
	return `${formate.replace(/[  ]/g, " ")} FCFA`;
}

/** Valeurs du filtre « Type » (URL : `?type=`). */
export type LogementTypeFiltre = "tous" | LogementType;

/** Valeurs du filtre « Statut » (URL : `?statut=`). */
export type LogementStatutFiltre = "tous" | LogementStatut;

/** Valeurs du filtre « Disponibilité » (URL : `?dispo=`). */
export type LogementDispoFiltre = "tous" | "disponibles";

/** Filtres de la liste des logements (URL + côté client). */
export interface LogementFiltres {
	type: LogementTypeFiltre;
	statut: LogementStatutFiltre;
	dispo: LogementDispoFiltre;
}

/**
 * Filtre la liste. `type`/api/v1/`statut` sont aussi envoyés au lister (params réels
 * du spec) : ré-appliqués ici sans effet — ce filtre garde le cas « disponible
 * uniquement » (`dispo`). Fonction pure, sans dépendance React.
 */
export function filtrerLogements(
	logements: readonly Logement[],
	filtres: LogementFiltres,
): Logement[] {
	return logements.filter((logement) => {
		if (filtres.type !== "tous" && logement.type !== filtres.type) return false;
		if (filtres.statut !== "tous" && logement.statut !== filtres.statut) {
			return false;
		}
		if (filtres.dispo === "disponibles" && logement.statut !== "DISPONIBLE") {
			return false;
		}
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageLogements {
	items: Logement[];
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
export function paginerLogements(
	logements: readonly Logement[],
	page: number,
	pageSize: number,
): PageLogements {
	const total = logements.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = logements.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
