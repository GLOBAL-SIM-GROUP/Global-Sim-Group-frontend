import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	CommandesPage,
	type CommandesSearch,
} from "#/features/restaurant/components/commandes-page";

/**
 * Commandes — Restaurant (M5). Filtres et page vivent dans l'URL ; statut et
 * période sont aussi envoyés au lister. Page gated par `RESTAURANT.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/restaurant/commandes/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESTAURANT.VOIR");
	},
	validateSearch: z.object({
		statut: z
			.enum([
				"tous",
				"EN_COURS",
				"EN_PREPARATION",
				"SERVIE",
				"PAYEE",
				"ANNULEE",
			])
			.optional(),
		type: z.enum(["tous", "SUR_PLACE", "A_EMPORTER", "LIVRAISON"]).optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: CommandesRoutePage,
});

function CommandesRoutePage() {
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
