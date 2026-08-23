import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

type CreerUtilisateurDto = components["schemas"]["CreerUtilisateurDto"];

/** Rôle utilisateur (wire `id_role` → `id`). */
export interface Role {
	id: string;
	code: string;
	libelle: string;
	description: string | null;
}

/** Activité (scope d'un caissier, wire `id_activite` → `id`). */
export interface ActiviteScope {
	id: string;
	code: string;
	libelle: string;
	actif: boolean;
}

/** Appels API du module RH — comptes utilisateurs. */
export function listRoles(): Promise<Role[]> {
	return getApiClient()
		.apiFetch<(Omit<Role, "id"> & { id_role: string })[]>("/api/v1/admin/roles")
		.then((data) =>
			data.map(({ id_role: id, ...reste }) => ({ id, ...reste })),
		);
}

export function listActivites(): Promise<ActiviteScope[]> {
	return getApiClient()
		.apiFetch<(Omit<ActiviteScope, "id"> & { id_activite: string })[]>(
			"/api/v1/finances/activites",
		)
		.then((data) =>
			data.map(({ id_activite: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Crée un compte utilisateur pour un employé (POST `CreerUtilisateurDto`). */
export function creerUtilisateur(body: {
	login: string;
	motDePasse: string;
	idRole: string;
	idEmploye?: string | null;
	idActiviteScope?: string | null;
}): Promise<unknown> {
	const corps = {
		login: body.login,
		mot_de_passe: body.motDePasse,
		id_role: body.idRole,
		actif: true,
		...(body.idEmploye ? { id_employe: body.idEmploye } : {}),
		...(body.idActiviteScope
			? { id_activite_scope: body.idActiviteScope }
			: {}),
	} satisfies Omit<CreerUtilisateurDto, "id_employe" | "id_activite_scope"> & {
		id_employe?: string | null;
		id_activite_scope?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/admin/utilisateurs", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
