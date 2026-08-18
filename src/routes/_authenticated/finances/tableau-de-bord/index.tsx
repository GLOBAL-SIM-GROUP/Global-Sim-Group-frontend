import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { TableauDeBordPage } from "#/features/finances/components/tableau-de-bord-page";

/**
 * Tableau de bord financier (M8). Pas de search param. Page gated par
 * `FINANCES.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/finances/tableau-de-bord/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	component: TableauDeBordRoutePage,
});

function TableauDeBordRoutePage() {
	return <TableauDeBordPage />;
}
