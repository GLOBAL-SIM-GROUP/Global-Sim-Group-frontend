import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

/**
 * Type de vêtement du catalogue pressing — la réponse de
 * `GET /pressing/catalogue` n'est pas typée dans la spec générée
 * (`content?: never`) : forme documentée par le contrat backend
 * `{id_type_vetement, libelle, actif}` (même convention que
 * `id_type_manifestation` côté salle de fête).
 */
export interface TypeVetement {
	id_type_vetement: string;
	libelle: string;
	actif: boolean;
}

/** Prestation du catalogue pressing — `{id_prestation, libelle, actif}`. */
export interface PrestationCatalogue {
	id_prestation: string;
	libelle: string;
	actif: boolean;
}

/** Réponse normalisée de `GET /pressing/catalogue`. */
export interface CataloguePressing {
	typesVetement: TypeVetement[];
	prestations: PrestationCatalogue[];
}

type CreerTypeVetementBody = components["schemas"]["CreerTypeVetementDto"];
type MajTypeVetementBody = components["schemas"]["MajTypeVetementDto"];
type CreerPrestationBody = components["schemas"]["CreerPrestationDto"];
type MajPrestationBody = components["schemas"]["MajPrestationDto"];

/** Entrée de catalogue normalisée avant renommage de l'id wire. */
interface EntreeBrute {
	id: string;
	libelle: string;
	actif: boolean;
}

/**
 * Normalise une entrée de catalogue : l'id wire est `id_*` snake_case
 * (`id_type_vetement` / `id_prestation`), avec repli sur `id` si le backend
 * sérialise autrement.
 */
function entreeCatalogue(
	value: unknown,
	cleId: "id_type_vetement" | "id_prestation",
): EntreeBrute | null {
	if (typeof value !== "object" || value === null) return null;
	const brut = value as Record<string, unknown>;
	const id = brut[cleId] ?? brut.id;
	if (typeof id !== "string" && typeof id !== "number") return null;
	if (typeof brut.libelle !== "string") return null;
	return {
		id: String(id),
		libelle: brut.libelle,
		actif: brut.actif !== false,
	};
}

function liste(
	values: unknown,
	cleId: "id_type_vetement" | "id_prestation",
): EntreeBrute[] {
	if (!Array.isArray(values)) return [];
	return values
		.map((v) => entreeCatalogue(v, cleId))
		.filter((v): v is EntreeBrute => v !== null);
}

/**
 * `GET /pressing/catalogue` — types de vêtement et prestations, actifs et
 * inactifs (`PRESSING.VOIR`). La spec laisse la réponse non typée : on
 * normalise `{types_vetement, prestations}` (camelCase toléré en repli).
 */
export async function getCatalogue(): Promise<CataloguePressing> {
	const brut = await getApiClient().apiFetch<unknown>(
		"/api/v1/pressing/catalogue",
	);
	const objet =
		typeof brut === "object" && brut !== null
			? (brut as Record<string, unknown>)
			: {};
	return {
		typesVetement: liste(
			objet.types_vetement ?? objet.typesVetement,
			"id_type_vetement",
		).map(
			({ id, ...reste }): TypeVetement => ({
				id_type_vetement: id,
				...reste,
			}),
		),
		prestations: liste(objet.prestations, "id_prestation").map(
			({ id, ...reste }): PrestationCatalogue => ({
				id_prestation: id,
				...reste,
			}),
		),
	};
}

/** `POST /pressing/catalogue/types-vetement` (PRESSING.GERER_CATALOGUE). */
export function creerTypeVetement(
	body: CreerTypeVetementBody,
): Promise<unknown> {
	return getApiClient().apiFetch("/api/v1/pressing/catalogue/types-vetement", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

/**
 * `PATCH /pressing/catalogue/types-vetement/{id}` — renommage et bascule
 * `actif` (PRESSING.GERER_CATALOGUE).
 */
export function majTypeVetement(
	id: string,
	body: MajTypeVetementBody,
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/pressing/catalogue/types-vetement/${id}`,
		{
			method: "PATCH",
			body: JSON.stringify(body),
		},
	);
}

/** `POST /pressing/catalogue/prestations` (PRESSING.GERER_CATALOGUE). */
export function creerPrestation(body: CreerPrestationBody): Promise<unknown> {
	return getApiClient().apiFetch("/api/v1/pressing/catalogue/prestations", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

/**
 * `PATCH /pressing/catalogue/prestations/{id}` — renommage et bascule
 * `actif` (PRESSING.GERER_CATALOGUE).
 */
export function majPrestation(
	id: string,
	body: MajPrestationBody,
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/pressing/catalogue/prestations/${id}`,
		{
			method: "PATCH",
			body: JSON.stringify(body),
		},
	);
}
