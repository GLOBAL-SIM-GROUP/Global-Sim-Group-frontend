import { createFileRoute } from "@tanstack/react-router";
import { CaissierDashboardPage } from "#/features/finances/components/caissier-dashboard-page";

export const Route = createFileRoute("/_authenticated/finances/caissier/$id/dashboard")({
	component: CaissierDashboardPage,
});
