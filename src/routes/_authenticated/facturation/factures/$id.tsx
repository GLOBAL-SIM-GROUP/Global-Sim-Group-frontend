import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { FactureFichePage } from "#/features/facturation/components/facture-fiche-page";

/**
 * Fiche détaillée d'une facture (M7). Pas de search param. Page gated par
 * `FACTURATION.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/facturation/factures/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FACTURATION.VOIR");
	},
	component: FactureFicheRoutePage,
});

function FactureFicheRoutePage() {
	const { id } = Route.useParams();
	return <FactureFichePage id={id} />;
}
