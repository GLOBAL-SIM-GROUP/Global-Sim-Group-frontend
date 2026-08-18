import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	SejoursPage,
	type SejoursSearch,
} from "#/features/residence/components/sejours-page";

/**
 * Liste des séjours courts (M2.3). Filtres et page vivent dans l'URL pour le
 * partage de liens ; appliqués côté client. Page gated par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/residence/sejours-courts/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	validateSearch: z.object({
		type: z.enum(["tous", "NUITEE", "SIESTE"]).optional(),
		statut: z.enum(["tous", "EN_COURS", "TERMINE", "ANNULE"]).optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: SejoursRoutePage,
});

function SejoursRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (maj: (prev: SejoursSearch) => SejoursSearch) => void =
		(maj) => {
			void navigate({ search: (prev) => maj(prev) });
		};
	return (
		<SejoursPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
