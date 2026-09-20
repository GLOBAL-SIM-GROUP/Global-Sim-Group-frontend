import { createFileRoute } from "@tanstack/react-router";

import { RestaurantCommandeDetailPage } from "#/features/espace-client/components/restaurant-commande-detail-page";

/**
 * Détail d'une commande restaurant de l'espace client
 * (`/espace-client/restaurant/$id`) — `GET /restaurant/portail/commandes/:id`
 * (`RESIDENT.VOIR`). Annulation possible tant que `EN_ATTENTE`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/restaurant/$id",
)({
	component: RestaurantCommandeRoutePage,
});

function RestaurantCommandeRoutePage() {
	const { id } = Route.useParams();
	return <RestaurantCommandeDetailPage id={id} />;
}
