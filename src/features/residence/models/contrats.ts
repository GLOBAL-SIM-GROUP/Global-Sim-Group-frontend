/**
 * Contrat de location longue durée (module M2.2).
 *
 * Types hand-typed revalidés sur le backend réel (GET /residence/contrats).
 * La clé primaire wire `id_contrat` est remappée en `id` par la couche API ;
 * les FK `id_client`/api/v1/`id_logement` restent en snake_case (comme `id_batiment`
 * côté logements). Ids bigint transportés en string.
 */
export type TypeLocation = "MENSUEL" | "ANNUEL";

export type ContratStatut =
	| "EN_ATTENTE"
	| "ACTIF"
	| "EXPIRE"
	| "RESILIE"
	| "TERMINE";

export interface Contrat {
	id: string;
	numero_contrat: string;
	id_client: string;
	id_logement: string;
	date_debut: string;
	date_fin_prevue: string | null;
	duree_mois: number | null;
	type_location: TypeLocation;
	montant_loyer: string;
	periodicite: string | null;
	statut: ContratStatut;
	date_signature: string | null;
}

/** Échéance d'un contrat (depuis `GET /contrats/{id}` → `echeances[]`). */
export interface Echeance {
	id: string;
	id_contrat: string;
	mois: number;
	annee: number;
	montant: string;
	date_echeance: string;
	/** PAYE | IMPAYE | PARTIEL | … (enum ouvert : repli `?? statut`). */
	statut: string;
	id_paiement: string | null;
}

/** Détail d'un contrat : le GET par id embarque les échéances. */
export interface ContratDetail extends Contrat {
	echeances: Echeance[];
}

/** Caution d'un contrat (GET /contrats/{id}/caution). */
export interface Caution {
	id: string;
	id_contrat: string;
	montant: string;
	date_versement: string | null;
	payee: boolean;
	date_restitution: string | null;
	montant_restitue: string | null;
	retenue: string | null;
	motif_retenue: string | null;
	statut: string;
	historique: unknown[];
}

/** Libellés français du statut de contrat (badge du tableau). */
export const CONTRAT_STATUT_LABELS: Record<ContratStatut, string> = {
	EN_ATTENTE: "En attente",
	ACTIF: "Actif",
	EXPIRE: "Expiré",
	RESILIE: "Résilié",
	TERMINE: "Terminé",
};

/** Libellés français du type de location (select du formulaire). */
export const TYPE_LOCATION_LABELS: Record<TypeLocation, string> = {
	MENSUEL: "Mensuel",
	ANNUEL: "Annuel",
};

/** Valeurs du filtre « Statut » (URL : `?statut=`). */
export type ContratStatutFiltre = "tous" | ContratStatut;

/** Filtres de la liste des contrats (URL + côté client). */
export interface ContratFiltres {
	statut: ContratStatutFiltre;
	locataire: string;
	logement: string;
	du: string;
	au: string;
}

/**
 * Contrat enrichi pour la liste : le lister ne documente pas les noms du client
 * ni le numéro du logement — ils sont résolus par la page via les caches
 * (clients par id, logements par id) puis joints ici.
 */
export interface ContratJoin extends Contrat {
	clientNom: string;
	logementNumero: string;
}

/**
 * Filtre la liste. Statut, texte « locataire » (nom complet) et « logement »
 * (numéro), période `du`/api/v1/`au` (comparaison lexicographique sur `date_debut`
 * `YYYY-MM-DD`). Fonction pure, sans dépendance React.
 */
export function filtrerContrats(
	contrats: readonly ContratJoin[],
	filtres: ContratFiltres,
): ContratJoin[] {
	return contrats.filter((contrat) => {
		if (filtres.statut !== "tous" && contrat.statut !== filtres.statut) {
			return false;
		}
		if (
			filtres.locataire &&
			!contrat.clientNom.toLowerCase().includes(filtres.locataire.toLowerCase())
		) {
			return false;
		}
		if (
			filtres.logement &&
			!contrat.logementNumero
				.toLowerCase()
				.includes(filtres.logement.toLowerCase())
		) {
			return false;
		}
		if (filtres.du && contrat.date_debut < filtres.du) return false;
		if (filtres.au && contrat.date_debut > filtres.au) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageContrats {
	items: ContratJoin[];
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
export function paginerContrats(
	contrats: readonly ContratJoin[],
	page: number,
	pageSize: number,
): PageContrats {
	const total = contrats.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = contrats.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}

/**
 * Date de fin prévue d'un contrat : la date de début décalée de `dureeMois`
 * mois, bornée au dernier jour du mois d'arrivée. `2026-01-01` + 12 → `2026-12-31`.
 * Sans durée → `null` (le backend gère le défaut).
 */
export function calculerDateFinPrevue(
	dateDebut: string,
	dureeMois: number | null,
): string | null {
	if (!dureeMois || dureeMois <= 0) return null;
	const debut = new Date(`${dateDebut}T00:00:00`);
	if (Number.isNaN(debut.getTime())) return null;
	const moisApres = new Date(
		debut.getFullYear(),
		debut.getMonth() + dureeMois,
		1,
	);
	const fin = new Date(moisApres.getFullYear(), moisApres.getMonth(), 0);
	const mois = String(fin.getMonth() + 1).padStart(2, "0");
	const jour = String(fin.getDate()).padStart(2, "0");
	return `${fin.getFullYear()}-${mois}-${jour}`;
}
