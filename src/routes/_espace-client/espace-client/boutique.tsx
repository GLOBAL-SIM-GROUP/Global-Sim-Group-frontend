import { createFileRoute } from "@tanstack/react-router";

import { BoutiquePage } from "#/features/espace-client/components/boutique-page";

/**
 * Boutique de l'espace client (`/espace-client/boutique`) : parcourir le
 * catalogue et composer un panier. Panier 100% frontend (`usePanierArticles`,
 * persisté en `localStorage`) — pas de soumission de vente réelle, cf.
 * `BoutiquePage`/mémoire `extension-clients-externes`.
 */
export const Route = createFileRoute("/_espace-client/espace-client/boutique")({
	component: BoutiquePage,
});
