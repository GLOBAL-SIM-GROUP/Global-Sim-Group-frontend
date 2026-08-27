import { getApiClient } from "./client";

export interface Signalement {
	id: string;
	titre: string;
	description: string;
	id_activite: string;
	statut: "OUVERT" | "EN_COURS" | "RESOLU" | "REJETE";
	id_utilisateur_declarant: string;
	note_resolution?: string;
	created_at?: string;
	updated_at?: string;
}

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

export async function listSignalements(params: SignalementListParams = {}) {
	const queryParams = new URLSearchParams();

	if (params.recherche) queryParams.append("recherche", params.recherche);
	if (params.sort) queryParams.append("sort", params.sort);
	if (params.order) queryParams.append("order", params.order);
	if (params.limit) queryParams.append("limit", params.limit.toString());
	if (params.offset) queryParams.append("offset", params.offset.toString());
	if (params.id_activite) queryParams.append("id_activite", params.id_activite);
	if (params.statut) queryParams.append("statut", params.statut);
	if (params.id_utilisateur_declarant)
		queryParams.append("id_utilisateur_declarant", params.id_utilisateur_declarant);

	const response = await getApiClient().get<Signalement[]>(
		`/api/v1/signalements?${queryParams.toString()}`,
	);
	return response;
}

export async function getSignalement(id: string) {
	if (!id || id === "undefined") {
		throw new Error("Signal ID must be a valid string");
	}
	const response = await getApiClient().get<Signalement>(`/api/v1/signalements/${id}`);
	return response;
}

export async function createSignalement(payload: SignalementCreatePayload) {
	const response = await getApiClient().post<Signalement>("/api/v1/signalements", payload);
	return response;
}

export async function prendre_en_charge_signalement(id: string) {
	const response = await getApiClient().post<void>(
		`/api/v1/signalements/${id}/prendre-en-charge`,
		{},
	);
	return response;
}

export async function resoudre_signalement(
	id: string,
	payload: SignalementResolutionPayload,
) {
	const response = await getApiClient().post<void>(
		`/api/v1/signalements/${id}/resoudre`,
		payload,
	);
	return response;
}

export async function rejeter_signalement(
	id: string,
	payload: SignalementResolutionPayload,
) {
	const response = await getApiClient().post<void>(
		`/api/v1/signalements/${id}/rejeter`,
		payload,
	);
	return response;
}
