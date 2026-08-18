import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	PaiementsPage,
	type PaiementsSearch,
} from "#/features/finances/components/paiements-page";

/**
 * Encaissements (M8). Période et type vivent dans l'URL et sont envoyés au
 * lister. Page gated par `FINANCES.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/finances/encaissements/")(
	{
		beforeLoad: ({ context }) => {
			requirePermissions(context.auth, "FINANCES.VOIR");
		},
		validateSearch: z.object({
			du: z.string().optional(),
			au: z.string().optional(),
			type: z.string().optional(),
			page: z.coerce.number().int().positive().optional(),
		}),
		component: PaiementsRoutePage,
	},
);

function PaiementsRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: PaiementsSearch) => PaiementsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<PaiementsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
