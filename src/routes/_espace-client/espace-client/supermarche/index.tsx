import { createFileRoute } from "@tanstack/react-router";

import { SuperMarcheCataloguePage } from "#/features/portail/components/supermarche-catalogue-page";

/**
 * Boutique de l'espace client (`/espace-client/supermarche`) : parcourir le
 * catalogue et composer un panier. Panier frontend (`usePanierArticles`,
 * persisté en `localStorage`) ; l'envoi passe par `POST
 * /market/portail/ventes` depuis la page panier — la demande naît
 * `EN_ATTENTE`, visible côté super-marché.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/supermarche/",
)({
	component: BoutiqueEspaceRoutePage,
});

function BoutiqueEspaceRoutePage() {
	return (
		<SuperMarcheCataloguePage
			breadcrumb={[
				{ label: "Espace client", to: "/espace-client" },
				{ label: "Super-Marché" },
			]}
			panierTo="/espace-client/panier"
			variant="client"
		/>
	);
}
