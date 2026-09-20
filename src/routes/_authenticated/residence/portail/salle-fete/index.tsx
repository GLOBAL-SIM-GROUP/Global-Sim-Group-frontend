import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { SalleFeteReservationsPage } from "#/features/portail/components/salle-fete-reservations-page";

/**
 * Réservations de salle de fête du portail résident : créneaux fermes du
 * jour, liste des demandes et nouvelle demande. Page gated par
 * `RESIDENT.VOIR` (l'endpoint `/salle-fete/portail/...` requiert
 * `RESIDENT.VOIR`, pas `SALLE_FETE.VOIR`).
 */
export const Route = createFileRoute(
	"/_authenticated/residence/portail/salle-fete/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENT.VOIR");
	},
	component: SalleFeteReservationsRoutePage,
});

function SalleFeteReservationsRoutePage() {
	return <SalleFeteReservationsPage />;
}
