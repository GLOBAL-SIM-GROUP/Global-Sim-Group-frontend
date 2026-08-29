import { getApiClient } from "./client";

/**
 * Appels API du module Signalements. Clé primaire wire `id_signalement` → `id`
 * (même remapping que les autres modules, ex. `id_facture` → `id` en
 * facturation) ; noms de fonctions en camelCase (même convention que le
 * reste de `core/api/`).
 */
export interface Signalement {
	id: string;
	titre: string;
	description: string;
	id_activite: string | null;
	statut: "OUVERT" | "EN_COURS" | "RESOLU" | "REJETE";
	id_utilisateur_declarant: string;
	id_utilisateur_traitant?: string | null;
	note_resolution?: string | null;
	date_signalement: string;
	date_resolution?: string | null;
	activite_code?: string | null;
	activite_libelle?: string | null;
	declarant_nom: string;
	declarant_prenom: string;
	declarant_login: string;
}

type SignalementWire = Omit<Signalement, "id"> & { id_signalement: string };

const toSignalement = ({
	id_signalement: id,
	...reste
}: SignalementWire): Signalement => ({ id, ...reste });

export interface SignalementListParams {
	recherche?: string;
	sort?: string;
	order?: "asc" | "desc";
	limit?: number;
	offset?: number;
	id_activite?: string;
	statut?: "OUVERT" | "EN_COURS" | "RESOLU" | "REJETE";
	id_utilisateur_declarant?: string;
}

export interface SignalementCreatePayload {
	titre: string;
	description: string;
	id_activite?: string;
}

export interface SignalementResolutionPayload {
	note_resolution: string;
}

export function listSignalements(
	params: SignalementListParams = {},
): Promise<Signalement[]> {
	const queryParams = new URLSearchParams();

	if (params.recherche) queryParams.append("recherche", params.recherche);
	if (params.sort) queryParams.append("sort", params.sort);
	if (params.order) queryParams.append("order", params.order);
	if (params.limit) queryParams.append("limit", params.limit.toString());
	if (params.offset) queryParams.append("offset", params.offset.toString());
	if (params.id_activite) queryParams.append("id_activite", params.id_activite);
	if (params.statut) queryParams.append("statut", params.statut);
	if (params.id_utilisateur_declarant) {
		queryParams.append(
			"id_utilisateur_declarant",
			params.id_utilisateur_declarant,
		);
	}

	return getApiClient()
		.apiFetch<SignalementWire[]>(
			`/api/v1/signalements?${queryParams.toString()}`,
		)
		.then((data) => data.map(toSignalement));
}

export function getSignalement(id: string): Promise<Signalement> {
	if (!id || id === "undefined") {
		throw new Error("Signal ID must be a valid string");
	}
	return getApiClient()
		.apiFetch<SignalementWire>(`/api/v1/signalements/${id}`)
		.then(toSignalement);
}

export function createSignalement(
	payload: SignalementCreatePayload,
): Promise<Signalement> {
	return getApiClient()
		.apiFetch<SignalementWire>("/api/v1/signalements", {
			method: "POST",
			body: JSON.stringify(payload),
		})
		.then(toSignalement);
}

/** Prise en charge — l'API n'accepte aucun payload pour cette action. */
export function prendreEnChargeSignalement(id: string): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/signalements/${id}/prendre-en-charge`,
		{ method: "POST" },
	);
}

export function resoudreSignalement(
	id: string,
	payload: SignalementResolutionPayload,
): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/signalements/${id}/resoudre`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function rejeterSignalement(
	id: string,
	payload: SignalementResolutionPayload,
): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/signalements/${id}/rejeter`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}
