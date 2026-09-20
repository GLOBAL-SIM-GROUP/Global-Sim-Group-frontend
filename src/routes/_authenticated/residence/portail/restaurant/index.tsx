import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { RestaurantCommandesPage } from "#/features/portail/components/restaurant-commandes-page";

/**
 * Commandes restaurant du portail résident : liste + composition d'une
 * commande en ligne. Page gated par `RESIDENT.VOIR` (comme les autres pages
 * du portail résident — l'endpoint `/restaurant/portail/...` requiert
 * `RESIDENT.VOIR`, pas `RESTAURANT.VOIR`).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/restaurant/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: RestaurantCommandesRoutePage,
});

function RestaurantCommandesRoutePage() {
	return <RestaurantCommandesPage />;
}
