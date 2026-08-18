import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	BulletinsPage,
	type BulletinsSearch,
} from "#/features/rh/components/bulletins-page";

/**
 * Bulletins de salaire (M9.3). Filtres et page vivent dans l'URL (filtrage côté
 * client). Page gated par `RH.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/rh/bulletins/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RH.VOIR");
	},
	validateSearch: z.object({
		employe: z.string().optional(),
		periode: z.string().optional(),
		statut: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: BulletinsRoutePage,
});

function BulletinsRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: BulletinsSearch) => BulletinsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<BulletinsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
