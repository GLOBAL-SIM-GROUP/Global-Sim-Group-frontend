import { createFileRoute } from "@tanstack/react-router";

import { DashboardGlobalPage } from "#/features/dashboard/components/dashboard-global-page";

export const Route = createFileRoute("/_authenticated/dashboard/")({
	component: DashboardGlobalPageComponent,
	head: () => ({ meta: [{ title: "Tableau de bord global" }] }),
});

function DashboardGlobalPageComponent() {
	return <DashboardGlobalPage />;
}
