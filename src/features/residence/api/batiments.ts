import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Batiment } from "../models/batiments";

type CreerBatimentDto = components["schemas"]["CreerBatimentDto"];
type MajBatimentDto = components["schemas"]["MajBatimentDto"];

/**
 * Le schéma généré type `adresse` en objet libre (`Record<string, never> |
 * null`) mais son propre exemple est une string ("Cocody Riviera 3") ; le
 * model Batiment la traite en `string | null`. On l'envoie donc en string
 * non vide ou `null` — le type du DTO est écarté pour ce seul champ.
 */
const adresseBody = (adresse: string | null | undefined): string | null =>
	adresse?.trim() ? adresse : null;

/**
 * Appels API du module Résidence — bâtiments.
 *
 * Chemins relatifs à `${VITE_API_URL}` (`/api/v1`). Réponse du lister
 * hand-typed (aucun schéma de réponse dans le spec, cf. docs/api.md) : à
 * revalider au smoke test réel. Aucun endpoint inventé : GET lister, PATCH et
 * DELETE par id (pas de GET par id dans le spec).
 */
/** Forme brute renvoyée par le lister : la clé primaire est `id_batiment` (pas
    `id`), constatée sur le backend réel (seed `admin`/`motdepasse`, GET
    /residence/batiments → `{"id_batiment":"2", ...}`). */
interface BatimentWire {
	id_batiment: string;
	code: string;
	nom: string;
	adresse: string | null;
	actif: boolean;
}

export async function listBatiments(): Promise<Batiment[]> {
	const data = await getApiClient().apiFetch<BatimentWire[]>(
		"/residence/batiments",
	);
	// Remappé en `id` : le reste du frontend (PATCH/DELETE par `{id}`, lien
	// « Voir les logements » avec `?batiment=`) utilise cette convention.
	return data.map(({ id_batiment: id, ...reste }) => ({ id, ...reste }));
}

/** Champs saisis par le formulaire bâtiment (create/update). */
export interface BatimentBody {
	code: string;
	nom: string;
	actif: boolean;
	adresse?: string | null;
}

/** Crée un bâtiment (POST `CreerBatimentDto`). */
export function creerBatiment(body: BatimentBody): Promise<unknown> {
	const corps = {
		code: body.code,
		nom: body.nom,
		actif: body.actif,
		adresse: adresseBody(body.adresse),
	} satisfies Omit<CreerBatimentDto, "adresse"> & { adresse?: string | null };
	return getApiClient().apiFetch("/api/v1/residence/batiments", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie un bâtiment existant (PATCH `MajBatimentDto`). */
export function modifierBatiment(
	id: string,
	body: BatimentBody,
): Promise<unknown> {
	const corps = {
		code: body.code,
		nom: body.nom,
		actif: body.actif,
		adresse: adresseBody(body.adresse),
	} satisfies Omit<MajBatimentDto, "adresse"> & { adresse?: string | null };
	return getApiClient().apiFetch(`/api/v1/residence/batiments/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Bascule le statut `actif` d'un bâtiment (PATCH `MajBatimentDto`). */
export function basculerBatimentActif(
	id: string,
	actif: boolean,
): Promise<unknown> {
	const corps: Pick<MajBatimentDto, "actif"> = { actif };
	return getApiClient().apiFetch(`/api/v1/residence/batiments/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Supprime un bâtiment (DELETE par id). */
export function supprimerBatiment(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/residence/batiments/${id}`, {
		method: "DELETE",
	});
}
