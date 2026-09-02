import { redirect } from "@tanstack/react-router";
import { hasAllPermissions, type PermissionCode } from "#/core/permissions";
import type { AuthSession } from "./session";
import { hasSessionHint } from "./session-hint";

/**
 * Guards de route (à utiliser dans `beforeLoad`). Ils lancent un `redirect`
 * TanStack Router : l'appelant ne poursuit pas son exécution après `throw`.
 */
export function requireAuth(session: AuthSession): void {
	if (!session.isAuthenticated) {
		// SSR : `localStorage` est inaccessible, donc `session.isAuthenticated`
		// est TOUJOURS faux ici même pour un utilisateur bien connecté — sans ce
		// garde-fou, chaque rechargement de page rebondirait sur /login (flash
		// « Vérification de la session… ») avant de revenir. Le cookie-indice
		// laisse passer ; la vraie vérification a lieu à l'hydratation client,
		// où ce guard s'exécute à nouveau avec `localStorage` disponible.
		if (hasSessionHint()) return;
		throw redirect({ href: "/login" });
	}
}

export function requirePermissions(
	session: AuthSession,
	...codes: PermissionCode[]
): void {
	requireAuth(session);
	if (!session.isAuthenticated) {
		// SSR laissé passer sur indice (ci-dessus) : pas de vrai utilisateur
		// pour évaluer les permissions ici. Le client refera ce contrôle pour de
		// vrai après restauration de la session.
		return;
	}
	const permissions = session.user?.permissions ?? [];
	if (!hasAllPermissions(permissions, codes)) {
		// Fondation : redirection vers l'accueil. Un écran 403 dédié peut être
		// ajouté plus tard sans changer le contrat de ce guard.
		throw redirect({ href: "/" });
	}
}
