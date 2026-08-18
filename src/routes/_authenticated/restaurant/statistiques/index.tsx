import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	StatistiquesPage,
	type StatistiquesSearch,
} from "#/features/restaurant/components/statistiques-page";

/**
 * Statistiques — Restaurant (M5). Filtre de période dans l'URL. Page gated par
 * `RESTAURANT.VOIR`.
 */
export const Route = createFileRoute(
	"/_authenticated/restaurant/statistiques/",
)({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESTAURANT.VOIR");
	},
	validateSearch: z.object({
		du: z.string().optional(),
		au: z.string().optional(),
	}),
	component: StatistiquesRoutePage,
});

function StatistiquesRoutePage() {
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
