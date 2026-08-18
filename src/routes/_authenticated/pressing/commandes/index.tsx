import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	CommandesPage,
	type CommandesSearch,
} from "#/features/pressing/components/commandes-page";

/**
 * Commandes — Pressing (M4). Filtres et page vivent dans l'URL ; recherche,
 * statut et période sont aussi envoyés au lister. Page gated par `PRESSING.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/pressing/commandes/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "PRESSING.VOIR");
	},
	validateSearch: z.object({
		recherche: z.string().optional(),
		statut: z
			.enum(["tous", "DEPOSE", "EN_TRAITEMENT", "PRET", "RETIRE", "ANNULEE"])
			.optional(),
		client: z.string().optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: CommandesRoutePage,
});

function CommandesRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: CommandesSearch) => CommandesSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<CommandesPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
