import { createFileRoute } from "@tanstack/react-router";

import { RestaurantCataloguePage } from "#/features/portail/components/restaurant-catalogue-page";

/**
 * Restaurant de l'espace client (`/espace-client/restaurant`) : parcourir le
 * menu public (`GET /restaurant/plats`) et composer un panier persisté en
 * `localStorage`. La commande se valide dans `/espace-client/panier` via
 * `POST /restaurant/portail/commandes` (`RESTAURANT.COMMANDER`).
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/restaurant/",
)({
	component: RestaurantEspaceRoutePage,
});

function RestaurantEspaceRoutePage() {
	return (
		<RestaurantCataloguePage
			breadcrumb={[
				{ label: "Espace client", to: "/espace-client" },
				{ label: "Restaurant" },
			]}
			panierTo="/espace-client/panier"
			variant="client"
		/>
	);
}
