import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	DepensesPage,
	type DepensesSearch,
} from "#/features/finances/components/depenses-page";

/**
 * Dépenses (M8). Période et page vivent dans l'URL ; la période est envoyée au
 * lister. Page gated par `FINANCES.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/finances/depenses/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FINANCES.VOIR");
	},
	validateSearch: z.object({
		du: z.string().optional(),
		au: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: DepensesRoutePage,
});

function DepensesRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: DepensesSearch) => DepensesSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<DepensesPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
