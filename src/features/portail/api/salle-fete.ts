import { getApiClient } from "#/core/api";

import type { CreneauOccupe, ReservationPortail } from "../models/salle-fete";

type ReservationWire = Omit<ReservationPortail, "id"> & {
	id_reservation: string;
};

const toReservation = ({
	id_reservation: id,
	...reste
}: ReservationWire): ReservationPortail => ({
	id,
	...reste,
});

/**
 * Appels API du portail résident — réservations de salle de fête
 * (`/salle-fete/portail/*`). Le client est déduit du JWT. Une demande
 * `EN_ATTENTE` n'occupe pas le créneau : `disponibilites` ne renvoie que les
 * réservations fermes (RESERVEE/CONFIRMEE/REALISEE) en projection réduite.
 */

/**
 * Créneaux fermes d'un jour (`YYYY-MM-DD`) — vue « libre/occupé » pour
 * choisir l'heure avant de demander (RESIDENT.VOIR).
 */
export function getDisponibilitesSalleFete(
	date: string,
): Promise<CreneauOccupe[]> {
	return getApiClient().apiFetch<CreneauOccupe[]>(
		`/api/v1/salle-fete/portail/disponibilites?date=${encodeURIComponent(date)}`,
	);
}

/** Liste des réservations du résident connecté (RESIDENT.VOIR). */
export async function listMesReservationsSalleFete(): Promise<
	ReservationPortail[]
> {
	const response = await getApiClient().apiFetch<ReservationWire[]>(
		"/api/v1/salle-fete/portail/reservations",
	);
	return response.map(toReservation);
}

/** Détail d'une réservation du résident (RESIDENT.VOIR). */
export async function getReservationSalleFete(
	id: string,
): Promise<ReservationPortail> {
	const response = await getApiClient().apiFetch<ReservationWire>(
		`/api/v1/salle-fete/portail/reservations/${id}`,
	);
	return toReservation(response);
}

/**
 * Corps de la demande de réservation — pas de tarif (le personnel prixe à
 * la validation). `type_manifestation` est un libellé libre : le catalogue
 * n'est pas lisible par un compte résident, d'où `hors_catalogue: true`.
 */
export interface ReservationSalleFeteBody {
	dateEvenement: string;
	heureDebut: string;
	/** Durée en heures (string entier côté wire). */
	duree: string;
	typeManifestation: string;
	observations?: string;
}

/** Demande un créneau (POST, SALLE_FETE.DEMANDER — 400 si date passée). */
export async function creerReservationSalleFete(
	body: ReservationSalleFeteBody,
): Promise<ReservationPortail> {
	const corps = {
		date_evenement: body.dateEvenement,
		heure_debut: body.heureDebut,
		duree: body.duree,
		type_manifestation: body.typeManifestation,
		hors_catalogue: true,
		...(body.observations ? { observations: body.observations } : {}),
	};
	const response = await getApiClient().apiFetch<ReservationWire>(
		"/api/v1/salle-fete/portail/reservations",
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
	return toReservation(response);
}

/**
 * Annule une demande encore `EN_ATTENTE` (POST `.../annuler`,
 * SALLE_FETE.DEMANDER — 409 si le personnel a déjà traité la demande).
 */
export function annulerReservationSalleFete(id: string): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/salle-fete/portail/reservations/${id}/annuler`,
		{ method: "POST" },
	);
}
