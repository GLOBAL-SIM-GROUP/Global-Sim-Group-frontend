import { createFileRoute, redirect } from "@tanstack/react-router";

import { HomePage } from "#/features/dashboard/components/home-page";

/**
 * `/home` est la destination « déjà connecté » codée en dur par la landing,
 * le login et l'inscription — plutôt que de changer ces quatre call sites, un
 * compte rôle CLIENT est rebondi d'ici vers son propre espace (`/espace-client`,
 * navbar dédiée) avant même de monter `AppShell`/`Sidebar`.
 */
export const Route = createFileRoute("/_authenticated/home")({
	beforeLoad: ({ context }) => {
		if (context.auth.user?.role === "CLIENT") {
			throw redirect({ to: "/espace-client" });
		}
	},
	component: HomePage,
});
