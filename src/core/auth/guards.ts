import { redirect } from "@tanstack/react-router";
import { hasAllPermissions, type PermissionCode } from "#/core/permissions";
import type { AuthSession } from "./session";

/**
 * Guards de route (à utiliser dans `beforeLoad`). Ils lancent un `redirect`
 * TanStack Router : l'appelant ne poursuit pas son exécution après `throw`.
 */
export function requireAuth(session: AuthSession): void {
	if (!session.isAuthenticated) {
		throw redirect({ href: "/login" });
	}
}

export function requirePermissions(
	session: AuthSession,
	...codes: PermissionCode[]
): void {
	requireAuth(session);
	const permissions = session.user?.permissions ?? [];
	if (!hasAllPermissions(permissions, codes)) {
		// Fondation : redirection vers l'accueil. Un écran 403 dédié peut être
		// ajouté plus tard sans changer le contrat de ce guard.
		throw redirect({ href: "/" });
	}
}
