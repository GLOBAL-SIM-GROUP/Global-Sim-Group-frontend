import { createFileRoute } from "@tanstack/react-router";

import { SalleFeteReservationDetailPage } from "#/features/espace-client/components/salle-fete-reservation-detail-page";

/**
 * Détail d'une demande de réservation de salle de fête
 * (`/espace-client/salle-fete/$id`) —
 * `GET /salle-fete/portail/reservations/:id` (`RESIDENT.VOIR`). Annulation
 * possible tant que `EN_ATTENTE`.
 */
export const Route = createFileRoute(
	"/_espace-client/espace-client/salle-fete/$id",
)({
	component: SalleFeteReservationRoutePage,
});

function SalleFeteReservationRoutePage() {
	const { id } = Route.useParams();
	return <SalleFeteReservationDetailPage id={id} />;
}
