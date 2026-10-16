import { createFileRoute } from "@tanstack/react-router";

import { PanierPage } from "#/features/portail/components/panier-page";

/**
 * Panier de l'espace client (`/espace-client/panier`) : récapitulatif des
 * articles restaurant et boutique puis envoi des demandes portail —
 * restaurant `POST /restaurant/portail/commandes`, boutique
 * `POST /market/portail/ventes`.
 */
export const Route = createFileRoute("/_espace-client/espace-client/panier")({
	component: PanierEspaceRoutePage,
});

function PanierEspaceRoutePage() {
	return (
		<PanierPage
			breadcrumb={[
				{ label: "Espace client", to: "/espace-client" },
				{ label: "Mon panier" },
			]}
			liens={{
				restaurant: "/espace-client/restaurant",
				boutique: "/espace-client/boutique",
				mesDemandes: "/espace-client/mes-demandes",
			}}
			variant="client"
		/>
	);
}
