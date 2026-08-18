import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { MoyensPaiementPage } from "#/features/finances/components/moyens-paiement-page";

/**
 * Moyens de paiement (M8). Pas de search param. Page gated par
 * `FINANCES.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/finances/moyens-paiement/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	component: MoyensPaiementRoutePage,
});

function MoyensPaiementRoutePage() {
	return <MoyensPaiementPage />;
}
