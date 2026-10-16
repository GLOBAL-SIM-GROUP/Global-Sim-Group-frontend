import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasPermission } from "#/core/permissions";
import { getAccessibleModules } from "#/core/permissions/modules";
import { HomePage } from "#/features/dashboard/components/home-page";

/**
 * `/home` est la destination « déjà connecté » codée en dur par la landing,
 * le login et l'inscription — plutôt que de changer ces quatre call sites,
 * les comptes sans contenu propre à `/home` sont rebondis ici avant même de
 * monter `AppShell`/`Sidebar` :
 * - rôle CLIENT → `/espace-client` (navbar dédiée) ;
 * - résident « pur » (`RESIDENT.VOIR` sans module métier ni `RAPPORTS.VOIR`,
 *   pour qui `/home` n'afficherait qu'une tuile réduite de « Mon espace
 *   résident ») → `/residence/portail`, l'accueil complet du portail. Un
 *   compte hybride (résident ET personnel) conserve `/home` : les modules
 *   métier y restent listés.
 */
export const Route = createFileRoute("/_authenticated/home")({
	beforeLoad: ({ context }) => {
		const user = context.auth.user;
		if (user?.role === "CLIENT") {
			throw redirect({ to: "/espace-client" });
		}
		const permissions = user?.permissions ?? [];
		if (
			user &&
			hasPermission(permissions, "RESIDENT.VOIR") &&
			!hasPermission(permissions, "RAPPORTS.VOIR") &&
			getAccessibleModules(permissions).length === 0
		) {
			throw redirect({ to: "/residence/portail" });
		}
	},
	component: HomePage,
});
