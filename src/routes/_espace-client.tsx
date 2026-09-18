import { createFileRoute, redirect } from "@tanstack/react-router";

import { ClientLayout } from "#/components/layout/client-layout";
import { hasSessionHint } from "#/core/auth";

/**
 * Layout protégé de l'espace client (comptes rôle CLIENT) — sibling de
 * `/_authenticated`, jamais imbriqué dedans : `_authenticated.tsx` impose
 * `AppShell`/`Sidebar` (staff/résident) à tout ce qu'il englobe, incompatible
 * avec la navbar de l'espace client. Même garde d'authentification que
 * `_authenticated.tsx` (cookie-indice SSR compris) ; restauration réelle de
 * la session déléguée à `ClientLayout` (`useSessionBootstrap`), rejouée à
 * l'hydratation.
 *
 * Un compte non-CLIENT (staff/résident) qui atterrit ici est renvoyé vers
 * `/home` — cet espace n'a pas vocation à leur être montré.
 */
export const Route = createFileRoute("/_espace-client")({
	beforeLoad: async ({ context, location }) => {
		await context.auth.restore();
		if (!context.auth.isAuthenticated) {
			if (hasSessionHint()) return;
			throw redirect({
				href: `/login?next=${encodeURIComponent(location.href)}`,
			});
		}
		if (context.auth.user && context.auth.user.role !== "CLIENT") {
			throw redirect({ to: "/home" });
		}
	},
	component: ClientLayout,
});
