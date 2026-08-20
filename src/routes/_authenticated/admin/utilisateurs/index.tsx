import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	UtilisateursPage,
	type UtilisateursSearch,
} from "#/features/admin/components/utilisateurs-page";

/**
 * Utilisateurs (M11). Filtres et page dans l'URL (filtrage côté client). Page
 * gated par `ADMIN.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/admin/utilisateurs/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "ADMIN.VOIR");
	},
	validateSearch: z.object({
		role: z.string().optional(),
		statut: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: UtilisateursRoutePage,
});

function UtilisateursRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: UtilisateursSearch) => UtilisateursSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<UtilisateursPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
