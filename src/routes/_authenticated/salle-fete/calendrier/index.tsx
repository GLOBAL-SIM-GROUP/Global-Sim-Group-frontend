import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	CalendrierPage,
	type CalendrierSearch,
} from "#/features/salle-fete/components/calendrier-page";

/**
 * Calendrier — Salle de fête (M6). Le mois affiché vit dans l'URL
 * (`?mois=YYYY-MM`). Page gated par `SALLE_FETE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/salle-fete/calendrier/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "SALLE_FETE.VOIR");
	},
	validateSearch: z.object({
		mois: z
			.string()
			.regex(/^\d{4}-\d{2}$/)
			.optional(),
	}),
	component: CalendrierRoutePage,
});

function CalendrierRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: CalendrierSearch) => CalendrierSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<CalendrierPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
