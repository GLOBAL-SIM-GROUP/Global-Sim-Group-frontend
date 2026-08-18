/**
 * Réservation de salle de fête (module M6). Types hand-typed revalidés sur le
 * backend réel (GET /salle-fete/reservations). Clé primaire wire
 * `id_reservation` → `id`.
 */
export type ReservationStatut =
	| "DISPONIBLE"
	| "RESERVEE"
	| "CONFIRMEE"
	| "REALISEE"
	| "ANNULEE";

export interface ReservationFete {
	id: string;
	id_client: string | null;
	date_evenement: string;
	heure_debut: string;
	duree: number;
	type_manifestation: string;
	tarif: string;
	acompte: string;
	solde: string;
	statut: ReservationStatut;
	observations: string | null;
}

/** Libellés français du statut de réservation. */
export const RESERVATION_STATUT_LABELS: Record<ReservationStatut, string> = {
	DISPONIBLE: "Disponible",
	RESERVEE: "Réservée",
	CONFIRMEE: "Confirmée",
	REALISEE: "Réalisée",
	ANNULEE: "Annulée",
};

/** Classes de badge (fond/texte) par statut de réservation. */
export const RESERVATION_STATUT_BADGE: Record<ReservationStatut, string> = {
	DISPONIBLE: "bg-[#27AE60] text-white",
	RESERVEE: "bg-[#E67E22] text-white",
	CONFIRMEE: "bg-[#2980B9] text-white",
	REALISEE: "bg-[#95A5A6] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

/** Jour d'une grille calendrier mensuelle. */
export interface JourGrille {
	/** Date ISO `YYYY-MM-DD` (comparée à `date_evenement`). */
	date: string;
	/** Numéro du jour dans le mois (1–31). */
	jour: number;
	/** Jour hors du mois affiché (débordement de la grille 6×7). */
	horsMois: boolean;
}

function pad2(nombre: number): string {
	return String(nombre).padStart(2, "0");
}

/**
 * Grille d'un mois (6 semaines × 7 jours, semaine débutant un lundi), avec les
 * jours de débordement des mois précédent/suivant. Fonction pure — testable.
 */
export function construireGrilleMois(
	annee: number,
	mois: number,
): JourGrille[] {
	const decalageLundi = (new Date(annee, mois - 1, 1).getDay() + 6) % 7;
	const debut = 1 - decalageLundi;
	const grille: JourGrille[] = [];
	for (let index = 0; index < 42; index += 1) {
		const jour = new Date(annee, mois - 1, debut + index);
		grille.push({
			date: `${jour.getFullYear()}-${pad2(jour.getMonth() + 1)}-${pad2(jour.getDate())}`,
			jour: jour.getDate(),
			horsMois: jour.getMonth() !== mois - 1,
		});
	}
	return grille;
}

/** Réservations tombant un jour donné (`date` au format `YYYY-MM-DD`). */
export function reservationsPourJour(
	reservations: readonly ReservationFete[],
	date: string,
): ReservationFete[] {
	return reservations.filter(
		(reservation) => reservation.date_evenement === date,
	);
}

/** Nombre de jours d'un mois (1–12). */
export function dernierJourMois(annee: number, mois: number): number {
	return new Date(annee, mois, 0).getDate();
}

/** Valeurs du filtre « Statut » (URL : `?statut=`). */
export type ReservationStatutFiltre = "tous" | ReservationStatut;

/** Filtres de la liste des réservations (URL + côté client). */
export interface ReservationFiltres {
	statut: ReservationStatutFiltre;
	type: string;
	du: string;
	au: string;
}

/** Filtre la liste : statut, texte « type de manifestation », période. Fonction pure. */
export function filtrerReservations(
	reservations: readonly ReservationFete[],
	filtres: ReservationFiltres,
): ReservationFete[] {
	return reservations.filter((reservation) => {
		if (filtres.statut !== "tous" && reservation.statut !== filtres.statut) {
			return false;
		}
		if (
			filtres.type &&
			!reservation.type_manifestation
				.toLowerCase()
				.includes(filtres.type.toLowerCase())
		) {
			return false;
		}
		if (filtres.du && reservation.date_evenement < filtres.du) return false;
		if (filtres.au && reservation.date_evenement > filtres.au) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageReservations {
	items: ReservationFete[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerReservations(
	reservations: readonly ReservationFete[],
	page: number,
	pageSize: number,
): PageReservations {
	const total = reservations.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = reservations.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
