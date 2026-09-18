import { getApiClient, toApiError } from "#/core/api";
import type { components } from "#/core/api/generated/schema";
import { getClient } from "#/features/clients/api/clients";
import type {
	FactureDetail,
	FactureStatut,
	LigneFacture,
} from "#/features/facturation/models/factures";

import type { Sejour, SejourStatut, SejourType } from "../models/sejours";

type CreerSejourDto = components["schemas"]["CreerSejourDto"];
type MajSejourDto = components["schemas"]["MajSejourDto"];
type PayerSejourDto = components["schemas"]["PayerSejourDto"];

type SejourWire = Omit<Sejour, "id"> & { id_sejour: string };

/**
 * Champs joints (numéro de logement, nom/prénoms du client) présents sur
 * `GET /residence/sejours` (liste) et `GET /residence/sejours/:id` (détail,
 * complété par un aller supplémentaire vers `/clients/:id` — voir
 * `getSejour`), mais ABSENTS du séjour renvoyé par `POST /residence/sejours`
 * et `POST /:id/payer` (vérifié en direct 2026-09-13). Un séjour de mutation
 * n'est donc jamais un `Sejour` complet : il se fusionne dans un séjour déjà
 * en cache (qui, lui, a ces champs), jamais utilisé seul pour l'affichage.
 */
type SejourMutationWire = Omit<
	SejourWire,
	"numero_logement" | "client_nom" | "client_prenoms"
>;
export type SejourSansJointures = Omit<
	Sejour,
	"numero_logement" | "client_nom" | "client_prenoms"
>;

const toSejourSansJointures = ({
	id_sejour: id,
	...reste
}: SejourMutationWire): SejourSansJointures => ({ id, ...reste });

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
		.apiFetch<SejourWire[]>("/api/v1/residence/sejours?limit=200")
		.then((data) =>
			data.map(({ id_sejour: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'un séjour (GET /residence/sejours/{id}) — fiche séjour. */
export async function getSejour(id: string): Promise<Sejour> {
	const sejourWire = await getApiClient().apiFetch<SejourWire>(
		`/api/v1/residence/sejours/${id}`,
	);
	const sejour: Sejour = {
		id: sejourWire.id_sejour,
		id_client: sejourWire.id_client,
		type_prestation: sejourWire.type_prestation,
		id_logement: sejourWire.id_logement,
		date_heure_arrivee: sejourWire.date_heure_arrivee,
		date_heure_depart_prevue: sejourWire.date_heure_depart_prevue,
		date_heure_depart_reelle: sejourWire.date_heure_depart_reelle,
		duree: sejourWire.duree,
		tarif: sejourWire.tarif,
		montant_total: sejourWire.montant_total,
		montant_paye: sejourWire.montant_paye,
		reste_a_payer: sejourWire.reste_a_payer,
		id_moyen_paiement: sejourWire.id_moyen_paiement,
		statut: sejourWire.statut,
		numero_logement: sejourWire.numero_logement,
		client_nom: null,
		client_prenoms: null,
	};

	// Enrichir avec les infos du client si id_client est fourni
	if (sejour.id_client) {
		try {
			const client = await getClient(sejour.id_client);
			sejour.client_nom = client.nom || null;
			sejour.client_prenoms = client.prenoms || null;
		} catch {
			// En cas d'erreur, laisser les champs client vides
		}
	}
	return sejour;
}

/**
 * Facture rattachée à un séjour, telle que renvoyée par le résultat d'un
 * paiement (`POST .../payer` ou `POST /residence/sejours` avec `paiement`) —
 * un sous-ensemble minimal de la facture (pas d'`id_facture`, pas de
 * `lignes`), distinct du détail complet renvoyé par `getSejourFacture`.
 */
export interface SejourPaiementFacture {
	montant_total: string;
	montant_paye: string;
	reste: string;
	statut: FactureStatut;
}

export interface SejourCreationResultat {
	sejour: SejourSansJointures;
	facture?: SejourPaiementFacture;
	numero?: string;
	id_paiement?: string;
}

export interface SejourPaiementResultat {
	sejour: SejourSansJointures;
	facture: SejourPaiementFacture;
	numero: string;
	id_paiement: string;
}

type FactureDetailWire = Omit<FactureDetail, "id" | "lignes"> & {
	id_facture: string;
	lignes: (Omit<LigneFacture, "id"> & { id_ligne: string })[];
};

/**
 * Facture d'un séjour (`GET /residence/sejours/:id/facture`). **La règle qui
 * compte** : un séjour n'a pas de facture tant qu'aucun encaissement n'a eu
 * lieu — le backend renvoie alors un 404 (« aucun paiement encore
 * encaissé »), qui n'est PAS une erreur ici mais l'état normal représenté par
 * `null` (état vide côté UI, pas un toast d'erreur).
 */
export async function getSejourFacture(
	id: string,
): Promise<FactureDetail | null> {
	try {
		const wire = await getApiClient().apiFetch<FactureDetailWire>(
			`/api/v1/residence/sejours/${id}/facture`,
		);
		return {
			...wire,
			id: wire.id_facture,
			lignes: wire.lignes.map(({ id_ligne: idLigne, ...reste }) => ({
				id: idLigne,
				...reste,
			})),
		};
	} catch (error) {
		if (toApiError(error).status === 404) return null;
		throw error;
	}
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
}

/**
 * Enregistre un séjour (POST `CreerSejourDto`). `id_client` (client existant)
 * et `client` (passage) sont mutuellement exclusifs.
 */
export function creerSejour(
	body: CreerSejourBody,
): Promise<SejourCreationResultat> {
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
	} satisfies Omit<CreerSejourDto, "id_client" | "date_heure_depart_prevue"> & {
		id_client?: string | null;
		date_heure_depart_prevue?: string | null;
	};
	return getApiClient()
		.apiFetch<{
			sejour: SejourMutationWire;
			facture?: SejourPaiementFacture;
			numero?: string;
			id_paiement?: string;
		}>("/api/v1/residence/sejours", {
			method: "POST",
			body: JSON.stringify(corps),
		})
		.then(({ sejour, ...reste }) => ({
			sejour: toSejourSansJointures(sejour),
			...reste,
		}));
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

/**
 * Enregistre un paiement de séjour (POST `/api/v1/sejours/{id}/payer`). Le
 * premier appel crée la facture ; les suivants la complètent. Quand le reste
 * atteint 0, le backend fait lui-même passer le séjour EN_COURS → TERMINE —
 * le `sejour` renvoyé porte déjà le nouveau statut, pas besoin d'un second
 * appel pour le refléter.
 */
export function payerSejour(
	id: string,
	body: { montant: string; idMoyen: string },
): Promise<SejourPaiementResultat> {
	const corps = {
		montant: body.montant,
		id_moyen: body.idMoyen,
	} satisfies PayerSejourDto;
	return getApiClient()
		.apiFetch<{
			sejour: SejourMutationWire;
			facture: SejourPaiementFacture;
			numero: string;
			id_paiement: string;
		}>(`/api/v1/residence/sejours/${id}/payer`, {
			method: "POST",
			body: JSON.stringify(corps),
		})
		.then(({ sejour, ...reste }) => ({
			sejour: toSejourSansJointures(sejour),
			...reste,
		}));
}
