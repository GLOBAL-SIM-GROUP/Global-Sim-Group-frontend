import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import { SyntheseGlobalePage } from "#/features/rapports/components/synthese-globale-page";

/**
 * Rapport de synthèse globale (M10). Période dans l'URL (défaut : mois
 * courant). Page gated par `ADMIN.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/rapports/synthese-globale/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	validateSearch: z.object({
		du: z.string().optional(),
		au: z.string().optional(),
	}),
	component: SyntheseGlobaleRoutePage,
});

function SyntheseGlobaleRoutePage() {
	return <SyntheseGlobalePage initialSearch={Route.useSearch()} />;
}
