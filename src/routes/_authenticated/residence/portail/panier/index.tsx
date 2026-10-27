import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { PanierPage } from "#/features/portail/components/panier-page";

/**
 * Panier du portail résident (`/residence/portail/panier`) : récapitulatif
 * des articles restaurant et super-marché puis envoi des demandes portail —
 * mêmes endpoints que l'espace client. Gated par `PORTAIL.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/panier/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PORTAIL.VOIR");
	},
	component: PanierPortailRoutePage,
});

function PanierPortailRoutePage() {
	return (
		<PanierPage
			breadcrumb={[
				{ label: "Accueil", to: "/" },
				{ label: "Mon espace résident", to: "/residence/portail" },
				{ label: "Mon panier" },
			]}
			liens={{
				restaurant: "/residence/portail/restaurant",
				supermarche: "/residence/portail/supermarche",
				mesDemandes: "/residence/portail/demandes",
			}}
			variant="resident"
		/>
	);
}
