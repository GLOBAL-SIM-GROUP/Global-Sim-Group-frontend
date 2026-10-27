import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	StatistiquesPage,
	type StatistiquesSearch,
} from "#/features/marchandise/components/statistiques-page";

/**
 * Statistiques — Market (M3). Filtre de période dans l'URL. Page gated par
 * `MARCHANDISE.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/marchandise/statistiques/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "MARCHANDISE.VOIR");
	},
	validateSearch: z.object({
		du: z.string().optional(),
		au: z.string().optional(),
	}),
	component: StatistiquesRoutePage,
});

function StatistiquesRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: StatistiquesSearch) => StatistiquesSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<StatistiquesPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
