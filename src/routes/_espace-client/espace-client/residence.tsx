import { createFileRoute } from "@tanstack/react-router";

import { ResidencePage } from "#/features/espace-client/components/residence-page";

/**
 * Résidence de l'espace client (`/espace-client/residence`) : formulaire de
 * demande de séjour court, sans appel réseau — aucun endpoint accessible à
 * un compte CLIENT n'existe côté backend pour ce service, cf.
 * `ResidencePage`/mémoire `extension-clients-externes`.
 */
export const Route = createFileRoute("/_espace-client/espace-client/residence")(
	{
		component: ResidencePage,
	},
);
