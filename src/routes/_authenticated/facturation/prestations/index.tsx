import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PrestationsPage } from "#/features/facturation/components/prestations-page";

/**
 * Prestations facturables (M7). Pas de search param. Page gated par
 * `FACTURATION.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/facturation/prestations/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FACTURATION.VOIR");
	},
	component: PrestationsRoutePage,
});

function PrestationsRoutePage() {
	return <PrestationsPage />;
}
