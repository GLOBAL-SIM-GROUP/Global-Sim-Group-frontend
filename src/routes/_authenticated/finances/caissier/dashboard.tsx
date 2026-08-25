import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { CaissierDashboardPage } from "#/features/finances/components/caissier-dashboard-page";

/**
 * Tableau de bord personnel du caissier (M8). Gated par `FINANCES.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/finances/caissier/dashboard",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	component: CaissierDashboardPage,
});
