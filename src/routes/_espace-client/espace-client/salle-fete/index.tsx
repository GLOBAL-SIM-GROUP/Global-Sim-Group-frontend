import { createFileRoute } from "@tanstack/react-router";

import { SalleFetePage } from "#/features/espace-client/components/salle-fete-page";

/**
 * Salle de fête de l'espace client (`/espace-client/salle-fete`) : formulaire
 * de demande de réservation, sans appel réseau — aucun endpoint accessible à
 * un compte CLIENT n'existe côté backend pour ce service, cf.
 * `SalleFetePage`/mémoire `extension-clients-externes`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/salle-fete",
)({
	component: SalleFetePage,
});
