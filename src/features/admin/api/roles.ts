import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Permission, Role } from "../models/roles";

type CreerRoleDto = components["schemas"]["CreerRoleDto"];
type MajRoleDto = components["schemas"]["MajRoleDto"];
type MajPermissionsRoleDto = components["schemas"]["MajPermissionsRoleDto"];

type RoleWire = Omit<Role, "id"> & { id_role: string };
type PermissionWire = Omit<Permission, "id"> & { id_permission: string };

/** Appels API du module Administration — rôles et permissions. */
export function listRoles(): Promise<Role[]> {
	return getApiClient()
		.apiFetch<RoleWire[]>("/api/v1/admin/roles")
		.then((data) =>
			data.map(({ id_role: id, ...reste }) => ({ id, ...reste })),
		);
}

export function listPermissions(): Promise<Permission[]> {
	return getApiClient()
		.apiFetch<PermissionWire[]>("/admin/permissions")
		.then((data) =>
			data.map(({ id_permission: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Permissions associées à un rôle (objets complets). */
export function getRolePermissions(id: string): Promise<Permission[]> {
	return getApiClient()
		.apiFetch<PermissionWire[]>(`/api/v1/admin/roles/${id}/permissions`)
		.then((data) =>
			data.map(({ id_permission: idPermission, ...reste }) => ({
				id: idPermission,
				...reste,
			})),
		);
}

/** Remplace les permissions d'un rôle (PUT `MajPermissionsRoleDto`). */
export function majRolePermissions(
	id: string,
	idPermissions: string[],
): Promise<unknown> {
	const corps = {
		id_permissions: idPermissions,
	} satisfies MajPermissionsRoleDto;
	return getApiClient().apiFetch(`/api/v1/admin/roles/${id}/permissions`, {
		method: "PUT",
		body: JSON.stringify(corps),
	});
}

/** Crée un rôle (POST `CreerRoleDto`). */
export function creerRole(body: {
	code: string;
	libelle: string;
	description?: string | null;
}): Promise<unknown> {
	const corps = {
		code: body.code,
		libelle: body.libelle,
		...(body.description?.trim() ? { description: body.description } : {}),
	} satisfies Omit<CreerRoleDto, "description"> & {
		description?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/admin/roles", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie un rôle (PATCH `MajRoleDto`). */
export function modifierRole(
	id: string,
	body: { libelle?: string; description?: string | null },
): Promise<unknown> {
	const payload: Partial<Omit<MajRoleDto, "description">> & {
		description?: string;
	} = {};
	if (body.libelle !== undefined) payload.libelle = body.libelle;
	if (body.description !== undefined)
		payload.description = body.description?.trim() || undefined;
	return getApiClient().apiFetch(`/api/v1/admin/roles/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}

/** Supprime un rôle (uniquement sans utilisateur associé). */
export function supprimerRole(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/admin/roles/${id}`, {
		method: "DELETE",
	});
}
