import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	ActiviteAbonnement,
	Offre,
	UniteAbonnement,
} from "../models/abonnements";

type CreerOffreDto = components["schemas"]["CreerOffreDto"];
type MajOffreDto = components["schemas"]["MajOffreDto"];

/** Filtres réels du lister (spec `/docs-json`) — envoyés tels quels. */
export interface FiltresOffres {
	recherche?: string;
	code?: string;
	activite?: ActiviteAbonnement;
	unite?: UniteAbonnement;
	actif?: boolean;
	id_prestation?: string;
	id_categorie_plat?: string;
	sort?: string;
	order?: "asc" | "desc";
	limit?: number;
	offset?: number;
}

/** Appels API du module Abonnements — catalogue des offres (`ABONNEMENT.*`). */
export function listOffres(filtres?: FiltresOffres): Promise<Offre[]> {
	const params = new URLSearchParams();
	if (filtres?.recherche) params.set("recherche", filtres.recherche);
	if (filtres?.code) params.set("code", filtres.code);
	if (filtres?.activite) params.set("activite", filtres.activite);
	if (filtres?.unite) params.set("unite", filtres.unite);
	if (filtres?.actif !== undefined) params.set("actif", String(filtres.actif));
	if (filtres?.id_prestation)
		params.set("id_prestation", filtres.id_prestation);
	if (filtres?.id_categorie_plat) {
		params.set("id_categorie_plat", filtres.id_categorie_plat);
	}
	if (filtres?.sort) params.set("sort", filtres.sort);
	if (filtres?.order) params.set("order", filtres.order);
	if (filtres?.limit !== undefined) params.set("limit", String(filtres.limit));
	if (filtres?.offset !== undefined) {
		params.set("offset", String(filtres.offset));
	}
	const qs = params.toString();
	return getApiClient().apiFetch<Offre[]>(
		`/api/v1/abonnement/offres${qs ? `?${qs}` : ""}`,
	);
}

/** Détail d'une offre (GET `/abonnement/offres/{id}`). */
export function getOffre(id: string): Promise<Offre> {
	return getApiClient().apiFetch<Offre>(`/api/v1/abonnement/offres/${id}`);
}

/**
 * Corps saisi par le formulaire d'offre (création). La couverture dépend de
 * `activite` — voir `validerOffre` dans `models` : PRESSING exige
 * `idPrestation` ; RESTAURATION accepte `idCategoriePlat`/`maxParJour`
 * optionnels (et impose `unite: 'REPAS'`).
 */
export interface OffreBody {
	code: string;
	libelle: string;
	description?: string;
	activite: ActiviteAbonnement;
	unite: UniteAbonnement;
	quota: string;
	prix: string;
	dureeJours: string;
	actif?: boolean;
	idPrestation?: string;
	idCategoriePlat?: string;
	maxParJour?: string;
}

/** Crée une offre (POST `CreerOffreDto`, `ABONNEMENT.CREER`). */
export function creerOffre(body: OffreBody): Promise<unknown> {
	const corps = {
		code: body.code.trim(),
		libelle: body.libelle.trim(),
		...(body.description?.trim()
			? { description: body.description.trim() }
			: {}),
		activite: body.activite,
		unite: body.unite,
		quota: body.quota.trim(),
		prix: body.prix.trim(),
		duree_jours: Number(body.dureeJours),
		actif: body.actif ?? true,
		...(body.idPrestation ? { id_prestation: body.idPrestation } : {}),
		...(body.idCategoriePlat
			? { id_categorie_plat: body.idCategoriePlat }
			: {}),
		...(body.maxParJour?.trim()
			? { max_par_jour: Number(body.maxParJour) }
			: {}),
	} satisfies CreerOffreDto;
	return getApiClient().apiFetch("/api/v1/abonnement/offres", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/**
 * Champs commerciaux modifiables (PATCH `MajOffreDto`, `ABONNEMENT.MODIFIER`)
 * — la couverture (activité, unité, prestation, catégorie, plafond) est
 * immuable après création : le formulaire d'édition ne propose pas ces
 * champs.
 */
export interface MajOffreBody {
	libelle?: string;
	description?: string | null;
	quota?: string;
	prix?: string;
	dureeJours?: string;
	actif?: boolean;
}

/** Modifie une offre (PATCH `/abonnement/offres/{id}`). */
export function majOffre(id: string, body: MajOffreBody): Promise<unknown> {
	const corps = {
		...(body.libelle !== undefined ? { libelle: body.libelle.trim() } : {}),
		...(body.description !== undefined
			? { description: body.description?.trim() || null }
			: {}),
		...(body.quota !== undefined ? { quota: body.quota.trim() } : {}),
		...(body.prix !== undefined ? { prix: body.prix.trim() } : {}),
		...(body.dureeJours !== undefined
			? { duree_jours: Number(body.dureeJours) }
			: {}),
		...(body.actif !== undefined ? { actif: body.actif } : {}),
	} satisfies Omit<MajOffreDto, "description"> & {
		description?: string | null;
	};
	return getApiClient().apiFetch(`/api/v1/abonnement/offres/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/**
 * Supprime une offre jamais vendue (DELETE, `ABONNEMENT.SUPPRIMER`). 409 si
 * déjà vendue — le seul recours est alors `PATCH { actif: false }` (le
 * dialogue de suppression le signale).
 */
export function supprimerOffre(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/abonnement/offres/${id}`, {
		method: "DELETE",
	});
}
