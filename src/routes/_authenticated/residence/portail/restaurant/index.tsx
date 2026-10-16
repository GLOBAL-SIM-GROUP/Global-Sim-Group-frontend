import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { RestaurantCataloguePage } from "#/features/portail/components/restaurant-catalogue-page";

/**
 * Restaurant du portail résident : carte des plats (`GET /restaurant/plats`)
 * avec panier `localStorage` — la commande se valide dans
 * `/residence/portail/panier` (`POST /restaurant/portail/commandes`), le
 * suivi dans « Mes demandes ». Gated par `PORTAIL.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/restaurant/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: RestaurantPortailRoutePage,
});

function RestaurantPortailRoutePage() {
	return (
		<RestaurantCataloguePage
			breadcrumb={[
				{ label: "Accueil", to: "/" },
				{ label: "Mon espace résident", to: "/residence/portail" },
				{ label: "Restaurant" },
			]}
			panierTo="/residence/portail/panier"
			variant="resident"
		/>
	);
}
