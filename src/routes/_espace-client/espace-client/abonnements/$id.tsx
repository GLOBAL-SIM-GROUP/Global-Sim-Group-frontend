import { createFileRoute } from "@tanstack/react-router";

import { AbonnementDetailEspacePage } from "#/features/espace-client/components/abonnement-detail-page";

/**
 * Détail d'un abonnement de l'espace client (`/espace-client/abonnements/$id`)
 * — historique des mouvements ; 404 backend si la souscription appartient à
 * un autre client.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/abonnements/$id",
)({
	component: AbonnementDetailRoutePage,
});

function AbonnementDetailRoutePage() {
	const { id } = Route.useParams();
	return <AbonnementDetailEspacePage id={id} />;
}
