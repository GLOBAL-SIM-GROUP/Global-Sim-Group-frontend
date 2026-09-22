import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SejourPortailDetailPage } from "#/features/portail/components/sejour-portail-detail-page";

/**
 * Détail d'une demande de séjour court du résident
 * (`/residence/portail/sejours/$id`) — `GET /residence/portail/sejours/:id`.
 * Page gated par `PORTAIL.VOIR` ; annulation tant que `EN_ATTENTE`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/sejours/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: SejourPortailDetailRoutePage,
});

function SejourPortailDetailRoutePage() {
	const { id } = Route.useParams();
	return <SejourPortailDetailPage id={id} variant="resident" />;
}
