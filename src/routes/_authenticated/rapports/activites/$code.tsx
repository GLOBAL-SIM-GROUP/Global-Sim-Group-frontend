import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import { RapportActivitePage } from "#/features/rapports/components/rapport-activite-page";

/**
 * Rapport par activité (M10). Code dans l'URL, période dans la search (défaut :
 * mois courant). Page gated par `ADMIN.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/rapports/activites/$code",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	validateSearch: z.object({
		du: z.string().optional(),
		au: z.string().optional(),
	}),
	component: RapportActiviteRoutePage,
});

function RapportActiviteRoutePage() {
	const { code } = Route.useParams();
	return <RapportActivitePage code={code} initialSearch={Route.useSearch()} />;
}
