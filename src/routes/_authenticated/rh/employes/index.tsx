import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	EmployesPage,
	type EmployesSearch,
} from "#/features/rh/components/employes-page";

/**
 * Employés — RH (M9.1). Filtres et page vivent dans l'URL (filtrage côté
 * client). Page gated par `RH.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/rh/employes/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RH.VOIR");
	},
	validateSearch: z.object({
		service: z.string().optional(),
		statut: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: EmployesRoutePage,
});

function EmployesRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: EmployesSearch) => EmployesSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<EmployesPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
