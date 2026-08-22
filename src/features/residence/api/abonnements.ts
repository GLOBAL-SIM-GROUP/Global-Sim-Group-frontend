import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	Abonnement,
	AbonnementStatut,
	AbonnementType,
} from "../models/abonnements";

type CreerAbonnementDto = components["schemas"]["CreerAbonnementDto"];
type MajAbonnementDto = components["schemas"]["MajAbonnementDto"];

/**
 * Le schéma généré type `date_fin` en objet libre (`Record<string, never> |
 * null`) mais c'est une vraie date ; on élargit ce champ (même pattern que
 * `equipements`/`etat` côté logements).
 */
type AbonnementWire = Omit<Abonnement, "id"> & { id_abonnement: string };

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/**
 * Appels API du module Résidence — abonnements. Réponses hand-typed revalidées
 * sur le backend réel. Aucun endpoint inventé : GET lister, POST création,
 * PATCH par id, POST `resilier`.
 */
export function listAbonnements(): Promise<Abonnement[]> {
	return getApiClient()
		.apiFetch<AbonnementWire[]>("/residence/abonnements")
		.then((data) =>
			data.map(({ id_abonnement: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Corps saisi par le formulaire d'abonnement (création). */
export interface AbonnementBody {
	idClient: string;
	service: string;
	type: AbonnementType;
	montant: string;
	dateDebut: string;
	dateFin?: string | null;
}

/** Souscrit un abonnement (POST `CreerAbonnementDto`). */
export function creerAbonnement(body: AbonnementBody): Promise<unknown> {
	const corps = {
		id_client: body.idClient,
		service: body.service,
		type: body.type,
		montant: body.montant,
		date_debut: body.dateDebut,
		date_fin: texteOuNull(body.dateFin),
		statut: "ACTIF",
	} satisfies Omit<CreerAbonnementDto, "id_logement" | "date_fin"> & {
		date_fin?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/residence/abonnements", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Corps saisi pour modifier un abonnement (PATCH `MajAbonnementDto`). */
export interface ModifierAbonnementBody {
	service: string;
	type: AbonnementType;
	montant: string;
	dateDebut: string;
	dateFin?: string | null;
	statut: AbonnementStatut;
}

/** Modifie un abonnement existant (PATCH par id). */
export function modifierAbonnement(
	id: string,
	body: ModifierAbonnementBody,
): Promise<unknown> {
	const corps = {
		service: body.service,
		type: body.type,
		montant: body.montant,
		date_debut: body.dateDebut,
		date_fin: texteOuNull(body.dateFin),
		statut: body.statut,
	} satisfies Omit<
		MajAbonnementDto,
		"id_client" | "id_logement" | "date_fin" | "montant_paye"
	> & {
		date_fin?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/residence/abonnements/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Résilie un abonnement (POST `/abonnements/{id}/resilier`). */
export function resilierAbonnement(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/residence/abonnements/${id}/resilier`, {
		method: "POST",
	});
}
