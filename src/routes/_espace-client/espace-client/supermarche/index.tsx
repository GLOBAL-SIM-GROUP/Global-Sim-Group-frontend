import { createFileRoute } from "@tanstack/react-router";

import { BoutiqueCataloguePage } from "#/features/portail/components/boutique-catalogue-page";

/**
 * Boutique de l'espace client (`/espace-client/boutique`) : parcourir le
 * catalogue et composer un panier. Panier frontend (`usePanierArticles`,
 * persisté en `localStorage`) ; l'envoi passe par `POST
 * /market/portail/ventes` depuis la page panier — la demande naît
 * `EN_ATTENTE`, visible côté marchandise.
 */
export const Route = createFileRoute("/_espace-client/espace-client/boutique/")(
	{
		component: BoutiqueEspaceRoutePage,
	},
);

function BoutiqueEspaceRoutePage() {
	return (
		<BoutiqueCataloguePage
			breadcrumb={[
				{ label: "Espace client", to: "/espace-client" },
				{ label: "Boutique" },
			]}
			panierTo="/espace-client/panier"
			variant="client"
		/>
	);
}
