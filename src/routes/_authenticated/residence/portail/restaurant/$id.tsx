import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { RestaurantCommandeDetailPage } from "#/features/portail/components/restaurant-commande-detail-page";

/**
 * Détail d'une commande restaurant du portail résident : lignes, suivi du
 * statut et annulation tant qu'elle est `EN_ATTENTE`. Page gated par
 * `PORTAIL.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/restaurant/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: RestaurantCommandeDetailRoutePage,
});

function RestaurantCommandeDetailRoutePage() {
	const { id } = Route.useParams();

	return <RestaurantCommandeDetailPage id={id} />;
}
