import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PortailEcheancesPage } from "#/features/portail/components/portail-echeances-page";

/**
 * Mes échéances de loyer (M2.5). Pas de search param. Page gated par
 * `RESIDENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/echeances/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: PortailEcheancesRoutePage,
});

function PortailEcheancesRoutePage() {
	return <PortailEcheancesPage />;
}
