import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	Logement,
	LogementStatut,
	LogementType,
} from "../models/logements";

type CreerLogementDto = components["schemas"]["CreerLogementDto"];
type MajLogementDto = components["schemas"]["MajLogementDto"];

/**
 * Le schéma généré type `equipements`/api/v1/`etat` en objet libre
 * (`Record<string, never> | null`) mais la description est du texte libre ; le
 * model Logement les traite en `string | null`. On les envoie donc en string
 * non vide ou `null` — le type du DTO est écarté pour ces seuls champs.
 */
const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/** Corps saisi par le formulaire logement (create/update). */
export interface LogementBody {
	numero: string;
	type: LogementType;
	tarif: string;
	statut: LogementStatut;
	idBatiment: string;
	equipements?: string | null;
	etat?: string | null;
}

/**
 * Appels API du module Résidence — logements.
 *
 * Chemins relatifs à `${VITE_API_URL}` (`/api/v1/api/v1`). Le lister documente des
 * paramètres `batiment`/api/v1/`type`/api/v1/`statut` marqués `required` à tort (cf.
 * docs/api.md) : `batiment` seul suffit (vérifié sur le backend réel) —
 * `type`/api/v1/`statut` seulement quand ils sont définis. Réponse du lister
 * hand-typed et revalidée sur le backend réel (GET /residence/logements) :
 * la clé primaire est `id_logement` (remappée en `id`). Aucun endpoint
 * inventé : GET lister, POST et PATCH par id — pas de DELETE ni de résiliation
 * dans le spec.
 */

/** Forme brute renvoyée par le lister (clé primaire `id_logement`, pas `id`). */
interface LogementWire {
	id_logement: string;
	numero: string;
	nom: string | null;
	type: LogementType;
	tarif: string;
	equipements: string | null;
	statut: LogementStatut;
	etat: string | null;
	id_batiment: string;
}

export interface ListLogementsParams {
	batiment: string;
	search?: string;
	type?: LogementType | "tous";
	statut?: LogementStatut | "tous";
}

export async function listLogements(
	params: ListLogementsParams,
): Promise<Logement[]> {
	const searchParams = new URLSearchParams({ batiment: params.batiment });
	if (params.search) searchParams.set("search", params.search);
	if (params.type && params.type !== "tous")
		searchParams.set("type", params.type);
	if (params.statut && params.statut !== "tous") {
		searchParams.set("statut", params.statut);
	}
	const qs = searchParams.toString();
	const data = await getApiClient().apiFetch<LogementWire[]>(
		`/api/v1/residence/logements${qs ? `?${qs}` : ""}`,
	);
	// Remappé en `id` : key React, PATCH par `{id}` et fiche utilisent cette
	// convention. `id_batiment` (FK) est conservé tel quel.
	return data.map(({ id_logement: id, ...reste }) => ({ id, ...reste }));
}

/** Détail d'un logement (GET /residence/logements/{id}) — fiche logement. */
export function getLogement(id: string): Promise<Logement> {
	return getApiClient()
		.apiFetch<LogementWire>(`/api/v1/residence/logements/${id}`)
		.then(({ id_logement: lid, ...reste }) => ({ id: lid, ...reste }));
}

/** Crée un logement (POST `CreerLogementDto`). */
export function creerLogement(body: LogementBody): Promise<unknown> {
	const corps = {
		numero: body.numero,
		type: body.type,
		tarif: body.tarif,
		statut: body.statut,
		id_batiment: body.idBatiment,
		equipements: texteOuNull(body.equipements),
		etat: texteOuNull(body.etat),
	} satisfies Omit<CreerLogementDto, "equipements" | "etat" | "numero"> & {
		/** Absent du schéma généré (même écart que `equipements`/`etat`
		 *  ci-dessus) mais bien un champ réel — voir `LogementWire.numero`. */
		numero: string;
		equipements?: string | null;
		etat?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/residence/logements", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie un logement existant (PATCH `MajLogementDto`, champs tous optionnels). */
export function modifierLogement(
	id: string,
	body: LogementBody,
): Promise<unknown> {
	const corps = {
		numero: body.numero,
		type: body.type,
		tarif: body.tarif,
		statut: body.statut,
		id_batiment: body.idBatiment,
		equipements: texteOuNull(body.equipements),
		etat: texteOuNull(body.etat),
	} satisfies Omit<MajLogementDto, "equipements" | "etat" | "numero"> & {
		numero: string;
		equipements?: string | null;
		etat?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/residence/logements/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}
