import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { ReservationFichePage } from "#/features/salle-fete/components/reservation-fiche-page";

/**
 * Fiche détaillée d'une réservation — Salle de fête (M6). Pas de search param.
 * Page gated par `SALLE_FETE.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/salle-fete/reservations/$id",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "SALLE_FETE.VOIR");
	},
	component: ReservationFicheRoutePage,
});

function ReservationFicheRoutePage() {
	const { id } = Route.useParams();
	return <ReservationFichePage id={id} />;
}
