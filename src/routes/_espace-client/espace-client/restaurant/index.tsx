import { createFileRoute } from "@tanstack/react-router";

import { RestaurantPage } from "#/features/espace-client/components/restaurant-page";

/**
 * Restaurant de l'espace client (`/espace-client/restaurant`) : parcourir le
 * menu et composer un panier. Panier 100% frontend (`usePanier`, persisté en
 * `localStorage`) — pas de soumission de commande réelle, cf.
 * `RestaurantPage`/mémoire `extension-clients-externes`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/restaurant",
)({
	component: RestaurantPage,
});
