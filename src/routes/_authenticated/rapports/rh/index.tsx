import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import { RapportRhPage } from "#/features/rapports/components/rapport-rh-page";

/**
 * Rapport RH (M10). Période dans l'URL (défaut : mois courant). Page gated par
 * `ADMIN.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/rapports/rh/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	validateSearch: z.object({
		du: z.string().optional(),
		au: z.string().optional(),
	}),
	component: RapportRhRoutePage,
});

function RapportRhRoutePage() {
	return <RapportRhPage initialSearch={Route.useSearch()} />;
}
