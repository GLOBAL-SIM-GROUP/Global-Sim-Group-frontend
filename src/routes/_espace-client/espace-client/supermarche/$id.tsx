import { createFileRoute } from "@tanstack/react-router";

import { SuperMarcheDemandeDetailEspacePage } from "#/features/espace-client/components/supermarche-demande-detail-page";

/**
 * Détail d'une demande super-marché de l'espace client
 * (`/espace-client/supermarche/$id`) — `GET /market/portail/ventes/:id`, gardé
 * par `PORTAIL.VOIR` (accessible à un compte CLIENT, vérifié en direct
 * 2026-09-27). Annulation possible tant que `EN_ATTENTE`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/supermarche/$id",
)({
	component: BoutiqueDemandeRoutePage,
});

function BoutiqueDemandeRoutePage() {
	const { id } = Route.useParams();
	return <SuperMarcheDemandeDetailEspacePage id={id} />;
}
