import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CaisseDashboardPage } from "#/features/finances/components/caisse-dashboard-page";

/**
 * Dashboard d'une caisse spécifique (M8). Gated par FINANCES.VOIR.
 */
export const Route = createFileRoute(
	"/_authenticated/finances/caisses/$id/dashboard",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	component: CaisseDashboardRoutePage,
});

function CaisseDashboardRoutePage() {
	const { id } = Route.useParams();
	return <CaisseDashboardPage id={id} />;
}
