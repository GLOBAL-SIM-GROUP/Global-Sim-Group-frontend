import { createFileRoute } from "@tanstack/react-router";

import { SalleFetePage } from "#/features/espace-client/components/salle-fete-page";

/**
 * Salle de fête de l'espace client (`/espace-client/salle-fete`) :
 * disponibilités du jour (`GET /salle-fete/portail/disponibilites`) puis
 * demande de réservation (`POST /salle-fete/portail/reservations`,
 * `SALLE_FETE.DEMANDER`). Le tarif est fixé par le personnel à la
 * validation.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/salle-fete/",
)({
	component: SalleFetePage,
});
