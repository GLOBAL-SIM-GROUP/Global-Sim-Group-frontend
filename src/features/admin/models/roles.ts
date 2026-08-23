/**
 * Rôles et permissions (module M11, 12.3/12.4). Hand-typed revalidés sur le
 * backend réel (GET /admin/roles, /admin/permissions, /admin/roles/{id}/permissions).
 * Clés primaires wire `id_role`/api/v1/`id_permission` → `id`.
 */
export interface Role {
	id: string;
	code: string;
	libelle: string;
	description: string | null;
}

export interface Permission {
	id: string;
	code: string;
	libelle: string;
}

/** Extrait le module d'un code de permission (« ADMIN.CREER » → « ADMIN »). */
export function moduleDePermission(code: string): string {
	return code.split(".")[0] ?? code;
}

/** Groupe les permissions par module, ordre alphabétique du module. */
export function permissionsParModule(
	permissions: readonly Permission[],
): Record<string, Permission[]> {
	const groupes: Record<string, Permission[]> = {};
	for (const permission of permissions) {
		const module = moduleDePermission(permission.code);
		if (!groupes[module]) groupes[module] = [];
		groupes[module].push(permission);
	}
	for (const module of Object.keys(groupes)) {
		groupes[module].sort((a, b) => a.code.localeCompare(b.code));
	}
	return Object.fromEntries(
		Object.entries(groupes).sort(([a], [b]) => a.localeCompare(b)),
	);
}
