import { createFileRoute } from "@tanstack/react-router";

import { BoutiquePage } from "#/features/espace-client/components/boutique-page";

/**
 * Boutique de l'espace client (`/espace-client/boutique`) : parcourir le
 * catalogue et composer un panier. Panier frontend (`usePanierArticles`,
 * persisté en `localStorage`) ; l'envoi passe par `POST
 * /market/portail/ventes` depuis la page panier — la demande naît
 * `EN_ATTENTE`, visible côté marchandise.
 */
export const Route = createFileRoute("/_espace-client/espace-client/boutique/")(
	{
		component: BoutiquePage,
	},
);
