import { createFileRoute } from "@tanstack/react-router";

import { RestaurantPage } from "#/features/espace-client/components/restaurant-page";

/**
 * Restaurant de l'espace client (`/espace-client/restaurant`) : parcourir le
 * menu public (`GET /restaurant/plats`) et composer un panier persisté en
 * `localStorage`. La commande se valide dans `/espace-client/panier` via
 * `POST /restaurant/portail/commandes` (`RESTAURANT.COMMANDER`).
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/restaurant/",
)({
	component: RestaurantPage,
});
