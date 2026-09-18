import { createFileRoute } from "@tanstack/react-router";

import { PanierPage } from "#/features/espace-client/components/panier-page";

/**
 * Panier de l'espace client (`/espace-client/panier`) : récapitulatif des
 * articles restaurant et boutique puis envoi de demande — aucun endpoint
 * CLIENT n'existe pour passer commande, cf. `PanierPage`.
 */
export const Route = createFileRoute("/_espace-client/espace-client/panier")({
	component: PanierPage,
});
