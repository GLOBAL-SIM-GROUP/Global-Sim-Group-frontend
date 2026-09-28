import { createFileRoute } from "@tanstack/react-router";

import { BoutiqueDemandeDetailPage } from "#/features/espace-client/components/boutique-demande-detail-page";

/**
 * Détail d'une demande boutique de l'espace client
 * (`/espace-client/boutique/$id`) — `GET /market/portail/ventes/:id`, gardé
 * par `PORTAIL.VOIR` (accessible à un compte CLIENT, vérifié en direct
 * 2026-09-27). Annulation possible tant que `EN_ATTENTE`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/boutique/$id",
)({
	component: BoutiqueDemandeRoutePage,
});

function BoutiqueDemandeRoutePage() {
	const { id } = Route.useParams();
	return <BoutiqueDemandeDetailPage id={id} />;
}
