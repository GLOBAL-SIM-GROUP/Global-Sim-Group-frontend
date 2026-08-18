import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import { RapportFinancierPage } from "#/features/rapports/components/rapport-financier-page";

/**
 * Rapport financier (M10). Période dans l'URL (défaut : mois courant). Page
 * gated par `ADMIN.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/rapports/financier/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	validateSearch: z.object({
		du: z.string().optional(),
		au: z.string().optional(),
	}),
	component: RapportFinancierRoutePage,
});

function RapportFinancierRoutePage() {
	return <RapportFinancierPage initialSearch={Route.useSearch()} />;
}
