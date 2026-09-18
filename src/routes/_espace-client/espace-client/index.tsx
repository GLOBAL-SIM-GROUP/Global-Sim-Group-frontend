import { createFileRoute } from "@tanstack/react-router";

import { AccueilPage } from "#/features/espace-client/components/accueil-page";

/**
 * Accueil de l'espace client (`/espace-client`) : vraie page d'entrée —
 * raccourcis vers les cinq services, résumé des dépôts pressing et lien
 * vers « Mes demandes ».
 */
export const Route = createFileRoute("/_espace-client/espace-client/")({
	component: AccueilPage,
});
