import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	ReservationFete,
	ReservationStatut,
} from "../models/reservations";

type CreerReservationFeteDto = components["schemas"]["CreerReservationFeteDto"];
type MajReservationFeteDto = components["schemas"]["MajReservationFeteDto"];

type ReservationWire = Omit<ReservationFete, "id"> & { id_reservation: string };

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/** Appels API du module Salle de fête — réservations. */
export function listReservations(filtres?: {
	du?: string;
	au?: string;
	statut?: string;
}): Promise<ReservationFete[]> {
	const params = new URLSearchParams();
	if (filtres?.du) params.set("du", filtres.du);
	if (filtres?.au) params.set("au", filtres.au);
	if (filtres?.statut && filtres.statut !== "tous") {
		params.set("statut", filtres.statut);
	}
	const qs = params.toString();
	return getApiClient()
		.apiFetch<ReservationWire[]>(
			`/salle-fete/reservations${qs ? `?${qs}` : ""}`,
		)
		.then((data) =>
			data.map(({ id_reservation: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'une réservation (`GET /salle-fete/reservations/{id}`, remap). */
export function getReservation(id: string): Promise<ReservationFete> {
	return getApiClient()
		.apiFetch<ReservationWire>(`/salle-fete/reservations/${id}`)
		.then(({ id_reservation: idReservation, ...reste }) => ({
			id: idReservation,
			...reste,
		}));
}

/** Corps saisi par le formulaire de réservation (create/update). */
export interface ReservationBody {
	idClient?: string | null;
	dateEvenement: string;
	heureDebut: string;
	duree: string;
	typeManifestation: string;
	tarif: string;
	acompte?: string | null;
	observations?: string | null;
}

/** Crée une réservation (POST `CreerReservationFeteDto`). */
export function creerReservation(body: ReservationBody): Promise<unknown> {
	const corps = {
		...(body.idClient ? { id_client: body.idClient } : {}),
		date_evenement: body.dateEvenement,
		heure_debut: body.heureDebut,
		duree: body.duree,
		type_manifestation: body.typeManifestation,
		tarif: body.tarif,
		observations: texteOuNull(body.observations),
	} satisfies Omit<CreerReservationFeteDto, "id_client" | "observations"> & {
		id_client?: string | null;
		observations?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/salle-fete/reservations", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie une réservation (PATCH `MajReservationFeteDto`). */
export function modifierReservation(
	id: string,
	body: ReservationBody,
): Promise<unknown> {
	const corps = {
		date_evenement: body.dateEvenement,
		heure_debut: body.heureDebut,
		duree: body.duree,
		type_manifestation: body.typeManifestation,
		tarif: body.tarif,
		acompte: texteOuNull(body.acompte),
		observations: texteOuNull(body.observations),
	} satisfies Omit<MajReservationFeteDto, "acompte" | "observations"> & {
		acompte?: string | null;
		observations?: string | null;
	};
	return getApiClient().apiFetch(`/salle-fete/reservations/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Confirme une réservation (POST confirmer, avec paiement de l'acompte). */
export function confirmerReservation(
	id: string,
	body: { montant: string; idMoyen: string },
): Promise<unknown> {
	return getApiClient().apiFetch(`/salle-fete/reservations/${id}/confirmer`, {
		method: "POST",
		body: JSON.stringify({
			paiement: { montant: body.montant, id_moyen: body.idMoyen },
		}),
	});
}

/** Marque une réservation comme réalisée (POST realiser, paiement du solde). */
export function realiserReservation(
	id: string,
	body: { montant: string; idMoyen: string },
): Promise<unknown> {
	return getApiClient().apiFetch(`/salle-fete/reservations/${id}/realiser`, {
		method: "POST",
		body: JSON.stringify({
			paiement: { montant: body.montant, id_moyen: body.idMoyen },
		}),
	});
}

/** Annule une réservation (POST annuler). */
export function annulerReservation(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/salle-fete/reservations/${id}/annuler`, {
		method: "POST",
	});
}

/** Met à jour le statut seul (PATCH partiel). */
export function majStatutReservation(
	id: string,
	statut: ReservationStatut,
): Promise<unknown> {
	return getApiClient().apiFetch(`/salle-fete/reservations/${id}`, {
		method: "PATCH",
		body: JSON.stringify({ statut }),
	});
}
