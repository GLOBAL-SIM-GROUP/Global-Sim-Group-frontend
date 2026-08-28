import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { FacturesPage } from "#/features/facturation/components/factures-page";

/**
 * Factures (M12). Page d'admin pour consulter toutes les factures,
 * filtrer par type, statut, et télécharger les PDFs.
 * Gated par `FACTURATION.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/facturation/factures/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FACTURATION.VOIR");
	},
	component: FacturesRoutePage,
});

function FacturesRoutePage() {
	return <FacturesPage />;
}
