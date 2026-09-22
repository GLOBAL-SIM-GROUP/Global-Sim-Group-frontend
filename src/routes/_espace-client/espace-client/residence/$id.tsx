import { createFileRoute } from "@tanstack/react-router";

import { SejourPortailDetailPage } from "#/features/portail/components/sejour-portail-detail-page";

/**
 * Détail d'une demande de séjour court (`/espace-client/residence/$id`) —
 * `GET /residence/portail/sejours/:id` (`PORTAIL.VOIR`). Annulation possible
 * tant que `EN_ATTENTE` ; motif de refus affiché le cas échéant.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/residence/$id",
)({
	component: ResidenceDetailRoutePage,
});

function ResidenceDetailRoutePage() {
	const { id } = Route.useParams();
	return <SejourPortailDetailPage id={id} variant="client" />;
}
