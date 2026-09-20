import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

/**
 * Type de manifestation du catalogue salle de fête — la réponse de
 * `GET /salle-fete/catalogue` n'est pas typée dans la spec générée
 * (`content?: never`) : forme documentée par le contrat backend
 * `{id_type_manifestation, libelle, actif}`.
 */
export interface TypeManifestation {
	id_type_manifestation: string;
	libelle: string;
	actif: boolean;
}

type CreerTypeManifestationBody =
	components["schemas"]["CreerTypeManifestationDto"];
type MajTypeManifestationBody =
	components["schemas"]["MajTypeManifestationDto"];

/** `GET /salle-fete/catalogue` — types actifs et inactifs (SALLE_FETE.VOIR). */
export function listTypesManifestation(): Promise<TypeManifestation[]> {
	return getApiClient().apiFetch("/api/v1/salle-fete/catalogue");
}

/** `POST /salle-fete/catalogue/types-manifestation` (SALLE_FETE.GERER_CATALOGUE). */
export function creerTypeManifestation(
	body: CreerTypeManifestationBody,
): Promise<unknown> {
	return getApiClient().apiFetch(
		"/api/v1/salle-fete/catalogue/types-manifestation",
		{
			method: "POST",
			body: JSON.stringify(body),
		},
	);
}

/**
 * `PATCH /salle-fete/catalogue/types-manifestation/{id}` — renommage et
 * bascule `actif` (SALLE_FETE.GERER_CATALOGUE).
 */
export function majTypeManifestation(
	id: string,
	body: MajTypeManifestationBody,
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/salle-fete/catalogue/types-manifestation/${id}`,
		{
			method: "PATCH",
			body: JSON.stringify(body),
		},
	);
}
