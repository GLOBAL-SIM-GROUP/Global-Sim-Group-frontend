import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	LogementsPage,
	type LogementsSearch,
} from "#/features/residence/components/logements-page";

/**
 * Liste des logements d'un bâtiment (M2.2 – Résidence). Le bâtiment est passé
 * en query `?batiment=` (paramètre réel du lister) ; filtres et page vivent
 * dans l'URL pour le partage de liens. Page gated par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/residence/logements/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	validateSearch: z.object({
		batiment: z.string().optional(),
		type: z
			.enum(["tous", "CHAMBRE", "STUDIO", "APPARTEMENT", "MEUBLE"])
			.optional(),
		statut: z
			.enum([
				"tous",
				"DISPONIBLE",
				"RESERVE",
				"OCCUPE",
				"EN_NETTOYAGE",
				"EN_MAINTENANCE",
				"INDISPONIBLE",
			])
			.optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: LogementsRoutePage,
});

function LogementsRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: LogementsSearch) => LogementsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<LogementsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
