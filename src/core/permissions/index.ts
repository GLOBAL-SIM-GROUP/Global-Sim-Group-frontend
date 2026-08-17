import type { PermissionCode } from "./types";

export type { ModuleCode, PermissionCode, PermissionVerb } from "./types";
export { MODULES, PERMISSION_VERBS } from "./types";

/**
 * Vérifications de permissions côté UI.
 *
 * ⚠️ Ces contrôles servent la UX (visibilité, navigation, désactivation
 * d'actions). Ils ne sont **pas** une frontière de sécurité : le backend
 * (`JwtAuthGuard` + `PermissionsGuard`) reste responsable de chaque opération
 * protégée. Les permissions proviennent uniquement de `GET /auth/me` — jamais
 * dérivées d'une URL ou d'une route.
 */
export function hasPermission(
	permissions: readonly string[],
	code: PermissionCode,
): boolean {
	return permissions.includes(code);
}

export function hasAnyPermission(
	permissions: readonly string[],
	codes: readonly PermissionCode[],
): boolean {
	return codes.some((code) => hasPermission(permissions, code));
}

export function hasAllPermissions(
	permissions: readonly string[],
	codes: readonly PermissionCode[],
): boolean {
	return codes.every((code) => hasPermission(permissions, code));
}
