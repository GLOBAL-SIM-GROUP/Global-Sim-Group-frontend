import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import { RapportFinancierPage } from "#/features/rapports/components/rapport-financier-page";

/**
 * Rapport financier (M10). Période dans l'URL (défaut : mois courant). Page
 * gated par `RAPPORTS.VOIR` (module réel, distinct d'`ADMIN` — vérifié en
 * direct 2026-09-27).
 */
export const Route = createFileRoute("/_authenticated/rapports/financier/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RAPPORTS.VOIR");
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
