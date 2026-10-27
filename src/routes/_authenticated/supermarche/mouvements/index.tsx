import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	MouvementsPage,
	type MouvementsSearch,
} from "#/features/marchandise/components/mouvements-page";

/**
 * Mouvements de stock — Market (M3). Filtres et page vivent dans l'URL pour le
 * partage de liens ; appliqués côté client. Page gated par `MARCHANDISE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/marchandise/mouvements/")(
	{
		beforeLoad: ({ context }) => {
			requirePermissions(context.auth, "MARCHANDISE.VOIR");
		},
		validateSearch: z.object({
			type: z.enum(["tous", "ENTREE", "SORTIE", "AJUSTEMENT"]).optional(),
			du: z.string().optional(),
			au: z.string().optional(),
			produit: z.string().optional(),
			page: z.coerce.number().int().positive().optional(),
		}),
		component: MouvementsRoutePage,
	},
);

function MouvementsRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: MouvementsSearch) => MouvementsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<MouvementsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
