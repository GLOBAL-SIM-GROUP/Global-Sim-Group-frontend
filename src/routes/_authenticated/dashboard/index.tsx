import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { DashboardGlobalPage } from "#/features/dashboard/components/dashboard-global-page";

/**
 * Tableau de bord global (M10) : agrège des données de plusieurs modules via
 * les mêmes endpoints `/rapports/*` que le reste du module Rapports. Gated
 * par `RAPPORTS.VOIR` — cette route n'avait jusqu'ici **aucun** garde
 * (seul le lien de la sidebar/accueil/Ctrl-K était masqué), incohérent avec
 * le reste de l'app où chaque route déclare son propre `beforeLoad`.
 */
export const Route = createFileRoute("/_authenticated/dashboard/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RAPPORTS.VOIR");
	},
	component: DashboardGlobalPageComponent,
	head: () => ({ meta: [{ title: "Tableau de bord global" }] }),
});

function DashboardGlobalPageComponent() {
	return <DashboardGlobalPage />;
}
