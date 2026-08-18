import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SejourFichePage } from "#/features/residence/components/sejour-fiche-page";

/**
 * Fiche détaillée d'un séjour court (M2.3). Pas de search param. Page gated
 * par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/sejours-courts/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	component: SejourFicheRoutePage,
});

function SejourFicheRoutePage() {
	const { id } = Route.useParams();
	return <SejourFichePage id={id} />;
}
