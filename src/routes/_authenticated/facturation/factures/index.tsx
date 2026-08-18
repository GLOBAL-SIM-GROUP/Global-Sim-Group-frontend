import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	FacturationPonctuellePage,
	type FacturationSearch,
} from "#/features/facturation/components/facturation-ponctuelle-page";

/**
 * Facturation ponctuelle (M7). La recherche et les filtres vivent dans l'URL
 * (filtrage côté client : le lister ignore la recherche). Page gated par
 * `FACTURATION.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/facturation/factures/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FACTURATION.VOIR");
	},
	validateSearch: z.object({
		recherche: z.string().optional(),
		statut: z.string().optional(),
		source: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: FacturationRoutePage,
});

function FacturationRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: FacturationSearch) => FacturationSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<FacturationPonctuellePage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
