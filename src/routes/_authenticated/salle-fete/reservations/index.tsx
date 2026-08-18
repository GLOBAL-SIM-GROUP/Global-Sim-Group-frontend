import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	ReservationsPage,
	type ReservationsSearch,
} from "#/features/salle-fete/components/reservations-page";

/**
 * Réservations — Salle de fête (M6). Filtres et page vivent dans l'URL ; statut
 * et période sont aussi envoyés au lister. Page gated par `SALLE_FETE.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/salle-fete/reservations/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "SALLE_FETE.VOIR");
	},
	validateSearch: z.object({
		statut: z
			.enum([
				"tous",
				"DISPONIBLE",
				"RESERVEE",
				"CONFIRMEE",
				"REALISEE",
				"ANNULEE",
			])
			.optional(),
		type: z.string().optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: ReservationsRoutePage,
});

function ReservationsRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: ReservationsSearch) => ReservationsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<ReservationsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
