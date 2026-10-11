import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";
import { idCaisseDto } from "#/features/finances/models/caisses";

import type {
	ReservationFete,
	ReservationStatut,
} from "../models/reservations";

type CreerReservationFeteDto = components["schemas"]["CreerReservationFeteDto"];
type MajReservationFeteDto = components["schemas"]["MajReservationFeteDto"];
type ValiderReservationFeteDto =
	components["schemas"]["ValiderReservationFeteDto"];

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
			`/api/v1/salle-fete/reservations${qs ? `?${qs}` : ""}`,
		)
		.then((data) =>
			data.map(({ id_reservation: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'une réservation (`GET /salle-fete/reservations/{id}`, remap). */
export function getReservation(id: string): Promise<ReservationFete> {
	return getApiClient()
		.apiFetch<ReservationWire>(`/api/v1/salle-fete/reservations/${id}`)
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
	/**
	 * `true` = libellé saisi librement (accepté tel quel) ; `false` = libellé
	 * choisi dans le catalogue (`GET /salle-fete/catalogue`), vérifié côté
	 * serveur. Défaut `true` (repli quand le catalogue est indisponible).
	 */
	horsCatalogue?: boolean;
	tarif: string;
	acompte?: string | null;
	observations?: string | null;
}

/**
 * Crée une réservation (POST `CreerReservationFeteDto`).
 *
 * Le DTO de création n'expose **pas** `acompte` (champ propre à
 * `MajReservationFeteDto`/`ValiderReservationFeteDto`) — l'acompte convenu
 * saisi au formulaire est reporté par un PATCH `{ acompte }` juste après la
 * création, sinon il serait silencieusement perdu. Gap de contrat à faire
 * remonter au backend (`acompte` devrait être accepté en création).
 */
export async function creerReservation(
	body: ReservationBody,
): Promise<unknown> {
	const corps = {
		...(body.idClient ? { id_client: body.idClient } : {}),
		date_evenement: body.dateEvenement,
		heure_debut: body.heureDebut,
		duree: body.duree,
		type_manifestation: body.typeManifestation,
		// `false` seulement si le libellé vient du catalogue — sinon le
		// backend rejette (« type de manifestation hors catalogue »).
		hors_catalogue: body.horsCatalogue ?? true,
		tarif: body.tarif,
		observations: texteOuNull(body.observations),
	} satisfies Omit<CreerReservationFeteDto, "id_client" | "observations"> & {
		id_client?: string | null;
		observations?: string | null;
	};
	const cree = await getApiClient().apiFetch<Record<string, unknown>>(
		"/api/v1/salle-fete/reservations",
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
	const idCree =
		typeof cree?.id_reservation === "string"
			? cree.id_reservation
			: typeof cree?.id === "string"
				? cree.id
				: undefined;
	if (idCree && body.acompte?.trim()) {
		await modifierReservation(idCree, body);
	}
	return cree;
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
		hors_catalogue: body.horsCatalogue ?? true,
		tarif: body.tarif,
		acompte: texteOuNull(body.acompte),
		observations: texteOuNull(body.observations),
	} satisfies Omit<MajReservationFeteDto, "acompte" | "observations"> & {
		acompte?: string | null;
		observations?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/salle-fete/reservations/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Confirme une réservation (POST confirmer, avec paiement de l'acompte). */
export function confirmerReservation(
	id: string,
	body: { montant: string; idMoyen?: string; idCaisse?: string },
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/salle-fete/reservations/${id}/confirmer`,
		{
			method: "POST",
			body: JSON.stringify({
				paiement: {
					montant: body.montant,
					// Le schéma déclare `id_moyen` requis mais le serveur tolère son
					// absence quand rien n'est à encaisser — l'envoyer vaudrait alors
					// MOYEN_PAIEMENT_SUPERFLU.
					...(body.idMoyen ? { id_moyen: body.idMoyen } : {}),
					...(body.idCaisse ? { id_caisse: idCaisseDto(body.idCaisse) } : {}),
				},
			}),
		},
	);
}

/**
 * Marque une réservation comme réalisée (POST realiser, paiement du solde
 * **exact** — `SOLDE_INCOMPLET` sinon). Une réservation déjà soldée se
 * réalise avec `montant: '0.00'` et sans `idMoyen`/`idCaisse` (aucun
 * encaissement, `id_paiement: null` en réponse).
 */
export function realiserReservation(
	id: string,
	body: { montant: string; idMoyen?: string; idCaisse?: string },
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/salle-fete/reservations/${id}/realiser`,
		{
			method: "POST",
			body: JSON.stringify({
				paiement: {
					montant: body.montant,
					...(body.idMoyen ? { id_moyen: body.idMoyen } : {}),
					...(body.idCaisse ? { id_caisse: idCaisseDto(body.idCaisse) } : {}),
				},
			}),
		},
	);
}

/**
 * Valide et tarife une demande de réservation `EN_ATTENTE` du portail
 * résident (`POST /salle-fete/reservations/{id}/valider` → `RESERVEE`,
 * SALLE_FETE.VALIDER). `acompte` est optionnel (montant convenu, encaissé
 * plus tard au comptoir).
 *
 * La spec générée type `acompte` en `Record<string, never> | null` (quirk
 * du générateur pour les strings nullables) — on envoie la string telle
 * quelle, d'où le cast.
 */
export function validerReservation(
	id: string,
	body: { tarif: string; acompte?: string | null },
): Promise<unknown> {
	const corps = {
		tarif: body.tarif,
		acompte: (body.acompte?.trim() ||
			null) as ValiderReservationFeteDto["acompte"],
	} satisfies ValiderReservationFeteDto;
	return getApiClient().apiFetch(
		`/api/v1/salle-fete/reservations/${id}/valider`,
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
}

/**
 * Annule une réservation (POST annuler) — sur une demande `EN_ATTENTE` c'est
 * un refus : le `motif` optionnel (≤255) est conservé dans
 * `motif_annulation` et visible par le résident.
 */
export function annulerReservation(
	id: string,
	motif?: string,
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/salle-fete/reservations/${id}/annuler`,
		{
			method: "POST",
			...(motif ? { body: JSON.stringify({ motif }) } : {}),
		},
	);
}

/** Met à jour le statut seul (PATCH partiel). */
export function majStatutReservation(
	id: string,
	statut: ReservationStatut,
): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/salle-fete/reservations/${id}`, {
		method: "PATCH",
		body: JSON.stringify({ statut }),
	});
}
