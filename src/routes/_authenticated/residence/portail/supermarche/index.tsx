import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SuperMarcheCataloguePage } from "#/features/portail/components/supermarche-catalogue-page";

/**
 * Boutique du portail résident : catalogue des produits avec panier
 * `localStorage` — la demande se valide dans `/residence/portail/panier`
 * (`POST /market/portail/ventes`), le suivi dans « Mes demandes ». Gated
 * par `PORTAIL.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/supermarche/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: BoutiquePortailRoutePage,
});

function BoutiquePortailRoutePage() {
	return (
		<SuperMarcheCataloguePage
			breadcrumb={[
				{ label: "Accueil", to: "/" },
				{ label: "Mon espace résident", to: "/residence/portail" },
				{ label: "Super-Marché" },
			]}
			panierTo="/residence/portail/panier"
			variant="resident"
		/>
	);
}
