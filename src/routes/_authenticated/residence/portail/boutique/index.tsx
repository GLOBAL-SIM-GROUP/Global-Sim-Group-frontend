import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { BoutiqueCataloguePage } from "#/features/portail/components/boutique-catalogue-page";

/**
 * Boutique du portail résident : catalogue des produits avec panier
 * `localStorage` — la demande se valide dans `/residence/portail/panier`
 * (`POST /market/portail/ventes`), le suivi dans « Mes demandes ». Gated
 * par `PORTAIL.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/boutique/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: BoutiquePortailRoutePage,
});

function BoutiquePortailRoutePage() {
	return (
		<BoutiqueCataloguePage
			breadcrumb={[
				{ label: "Accueil", to: "/" },
				{ label: "Mon espace résident", to: "/residence/portail" },
				{ label: "Boutique" },
			]}
			panierTo="/residence/portail/panier"
			variant="resident"
		/>
	);
}
