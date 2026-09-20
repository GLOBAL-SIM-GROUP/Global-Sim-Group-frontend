/**
 * Réservations de salle de fête du portail résident (endpoints
 * `/salle-fete/portail/*`). Types hand-typés : le schéma OpenAPI généré est
 * en retard sur le backend réel (aucun endpoint `portail` salle-fête n'y
 * figure encore).
 *
 * La demande naît `EN_ATTENTE` et n'occupe PAS le créneau — seules les
 * réservations `RESERVEE`/`CONFIRMEE`/`REALISEE` remontent dans
 * `disponibilites`. Pas de tarif à la demande : le personnel prixe à la
 * validation (`tarif`/`solde` renseignés ensuite).
 */

export type ReservationPortailStatut =
	| "EN_ATTENTE"
	| "RESERVEE"
	| "CONFIRMEE"
	| "REALISEE"
	| "ANNULEE";

export interface ReservationPortail {
	id: string;
	date_evenement: string;
	/** `HH:MM`. */
	heure_debut: string;
	/** Durée en heures (string côté wire). */
	duree: string;
	type_manifestation: string;
	statut: ReservationPortailStatut;
	observations: string | null;
	/** Raison du refus quand le personnel a annulé la demande. */
	motif_annulation: string | null;
	tarif: string | null;
	solde: string | null;
}

/**
 * Créneau ferme du jour (GET `/salle-fete/portail/disponibilites?date=`) —
 * projection réduite, sans client ni libellé : juste de quoi repérer les
 * heures déjà occupées avant de formuler une demande.
 */
export interface CreneauOccupe {
	date_evenement: string;
	heure_debut: string;
	duree: string;
	statut: string;
}

/** Libellés français du statut de réservation portail. */
export const RESERVATION_PORTAIL_STATUT_LABELS: Record<
	ReservationPortailStatut,
	string
> = {
	EN_ATTENTE: "En attente de validation",
	RESERVEE: "Réservée",
	CONFIRMEE: "Confirmée",
	REALISEE: "Réalisée",
	ANNULEE: "Annulée",
};

/** Classes de badge (fond/texte) par statut — palette portail. */
export const RESERVATION_PORTAIL_STATUT_BADGE: Record<
	ReservationPortailStatut,
	string
> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	RESERVEE: "bg-[#E67E22] text-white",
	CONFIRMEE: "bg-[#2980B9] text-white",
	REALISEE: "bg-[#27AE60] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

/** Étapes visibles côté résident. */
export const RESERVATION_PORTAIL_ETAPES: ReservationPortailStatut[] = [
	"EN_ATTENTE",
	"RESERVEE",
	"CONFIRMEE",
	"REALISEE",
];

/** Vrai tant que la demande peut encore être annulée par le résident. */
export function estReservationAnnulable(
	reservation: Pick<ReservationPortail, "statut">,
): boolean {
	return reservation.statut === "EN_ATTENTE";
}
