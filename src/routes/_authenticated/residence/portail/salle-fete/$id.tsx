import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SalleFeteReservationDetailPage } from "#/features/portail/components/salle-fete-reservation-detail-page";

/**
 * Détail d'une demande de réservation de salle de fête du portail résident :
 * créneau, tarif une fois validé, motif d'annulation et annulation tant
 * qu'elle est `EN_ATTENTE`. Page gated par `RESIDENT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/salle-fete/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: SalleFeteReservationDetailRoutePage,
});

function SalleFeteReservationDetailRoutePage() {
	const { id } = Route.useParams();

	return <SalleFeteReservationDetailPage id={id} />;
}
