import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Sejour, SejourStatut, SejourType } from "../models/sejours";

type CreerSejourDto = components["schemas"]["CreerSejourDto"];
type MajSejourDto = components["schemas"]["MajSejourDto"];
type PayerSejourDto = components["schemas"]["PayerSejourDto"];

type SejourWire = Omit<Sejour, "id"> & { id_sejour: string };

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/**
 * Appels API du module Résidence — séjours courts. Réponses hand-typed
 * revalidées sur le backend réel. Aucun endpoint inventé : GET lister, POST
 * création, PATCH par id, POST `payer`. « Générer une facture/reçu » n'a pas
 * d'endpoint réel → omis.
 */
export function listSejours(): Promise<Sejour[]> {
	return getApiClient()
		..apiFetch<SejourWire[]>("/api/v1/residence/sejours")
		.then((data) =>
			data.map(({ id_sejour: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'un séjour (GET /residence/sejours/{id}) — fiche séjour. */
export function getSejour(id: string): Promise<Sejour> {
	return getApiClient()
		..apiFetch<SejourWire>(`/api/v1/residence/sejours/${id}`)
		.then(({ id_sejour: sid, ...reste }) => ({ id: sid, ...reste }));
}

/** Corps saisi par le formulaire d'enregistrement d'un séjour. */
export interface CreerSejourBody {
	typePrestation: SejourType;
	idLogement: string;
	/** Date-heure au format backend `YYYY-MM-DD HH:MM:SS`. */
	dateHeureArrivee: string;
	dateHeureDepartPrevue?: string | null;
	tarif: string;
	/** Client existant (base unique) OU client de passage (nouveau). */
	idClient?: string | null;
	client?: { nom: string; prenoms: string; telPrincipal: string } | null;
	/** Paiement initial éventuel (moyen de paiement). */
	paiement?: { montant: string; idMoyen: string } | null;
}

/**
 * Enregistre un séjour (POST `CreerSejourDto`). `id_client` (client existant)
 * et `client` (passage) sont mutuellement exclusifs ; le paiement initial est
 * optionnel.
 */
export function creerSejour(body: CreerSejourBody): Promise<unknown> {
	const corps = {
		type_prestation: body.typePrestation,
		id_logement: body.idLogement,
		date_heure_arrivee: body.dateHeureArrivee,
		date_heure_depart_prevue: texteOuNull(body.dateHeureDepartPrevue),
		tarif: body.tarif,
		statut: "EN_COURS",
		...(body.idClient ? { id_client: body.idClient } : {}),
		...(body.client
			? {
					client: {
						nom: body.client.nom,
						prenoms: body.client.prenoms,
						tel_principal: body.client.telPrincipal,
						type_client: "PASSAGE" as const,
					},
				}
			: {}),
		...(body.paiement
			? {
					paiement: {
						montant: body.paiement.montant,
						id_moyen: body.paiement.idMoyen,
					},
				}
			: {}),
	} satisfies Omit<CreerSejourDto, "id_client" | "date_heure_depart_prevue"> & {
		id_client?: string | null;
		date_heure_depart_prevue?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/residence/sejours", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Corps saisi pour modifier un séjour (PATCH `MajSejourDto`). */
export interface ModifierSejourBody {
	typePrestation: SejourType;
	dateHeureArrivee: string;
	dateHeureDepartPrevue?: string | null;
	tarif: string;
	statut: SejourStatut;
}

/** Modifie un séjour existant (PATCH par id). */
export function modifierSejour(
	id: string,
	body: ModifierSejourBody,
): Promise<unknown> {
	const corps = {
		type_prestation: body.typePrestation,
		date_heure_arrivee: body.dateHeureArrivee,
		date_heure_depart_prevue: texteOuNull(body.dateHeureDepartPrevue),
		tarif: body.tarif,
		statut: body.statut,
	} satisfies Omit<MajSejourDto, "date_heure_depart_prevue"> & {
		date_heure_depart_prevue?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/residence/sejours/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Enregistre un paiement de séjour (POST `/sejours/{id}/payer`). */
export function payerSejour(
	id: string,
	body: { montant: string; idMoyen: string },
): Promise<unknown> {
	const corps = {
		montant: body.montant,
		id_moyen: body.idMoyen,
	} satisfies PayerSejourDto;
	return getApiClient().apiFetch(`/api/v1/residence/sejours/${id}/payer`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
