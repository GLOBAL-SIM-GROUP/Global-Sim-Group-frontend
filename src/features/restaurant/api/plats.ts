import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { CategoriePlat, Plat } from "../models/plats";

type CreerPlatDto = components["schemas"]["CreerPlatDto"];
type MajPlatDto = components["schemas"]["MajPlatDto"];
type CreerCategoriePlatDto = components["schemas"]["CreerCategoriePlatDto"];

/**
 * Le schéma généré type `id_categorie_plat`/api/v1/`description` en objet libre
 * (`Record<string, never> | null`) mais ce sont de vraies valeurs ; on élargit
 * ces champs (même pattern que `equipements`/api/v1/`etat` côté logements).
 */
type PlatWire = Omit<Plat, "id"> & { id_plat: string };
type CategoriePlatWire = Omit<CategoriePlat, "id"> & {
	id_categorie_plat: string;
};

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/** Appels API du module Restaurant — plats et catégories. */
export function listPlats(): Promise<Plat[]> {
	return getApiClient()
		.apiFetch<PlatWire[]>("/api/v1/restaurant/plats")
		.then((data) =>
			data.map(({ id_plat: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Catégories de plats (GET /restaurant/categories). */
export function listCategoriesPlats(): Promise<CategoriePlat[]> {
	return getApiClient()
		.apiFetch<CategoriePlatWire[]>("/api/v1/restaurant/categories")
		.then((data) =>
			data.map(({ id_categorie_plat: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Corps saisi par le formulaire plat (create/update). */
export interface PlatBody {
	nom: string;
	id_categorie_plat?: string | null;
	prix: string;
	disponible?: boolean;
	description?: string | null;
	image_url?: string | null;
}

/** Crée un plat (POST `CreerPlatDto`). */
export function creerPlat(body: PlatBody): Promise<unknown> {
	const corps = {
		nom: body.nom,
		id_categorie_plat: texteOuNull(body.id_categorie_plat),
		prix: body.prix,
		disponible: body.disponible ?? true,
		description: texteOuNull(body.description),
		image_url: texteOuNull(body.image_url),
	} satisfies Omit<CreerPlatDto, "id_categorie_plat" | "description"> & {
		id_categorie_plat?: string | null;
		description?: string | null;
		image_url?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/restaurant/plats", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie un plat (PATCH `MajPlatDto`). */
export function modifierPlat(id: string, body: PlatBody): Promise<unknown> {
	const corps = {
		nom: body.nom,
		id_categorie_plat: texteOuNull(body.id_categorie_plat),
		prix: body.prix,
		disponible: body.disponible ?? true,
		description: texteOuNull(body.description),
		image_url: texteOuNull(body.image_url),
	} satisfies Omit<MajPlatDto, "id_categorie_plat" | "description"> & {
		id_categorie_plat?: string | null;
		description?: string | null;
		image_url?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/restaurant/plats/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Crée une catégorie de plat (POST `CreerCategoriePlatDto`). */
export function creerCategoriePlat(body: {
	libelle: string;
}): Promise<unknown> {
	const corps = { libelle: body.libelle } satisfies CreerCategoriePlatDto;
	return getApiClient().apiFetch("/api/v1/restaurant/categories", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
