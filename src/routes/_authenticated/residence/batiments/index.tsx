import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	type BatimentsSearch,
	BuildingsPage,
} from "#/features/residence/components/buildings-page";

/**
 * Liste des bâtiments (M2.1 – Résidence). Filtres et page vivent dans l'URL
 * pour le partage de liens ; appliqués côté client (le lister ne documente
 * aucun paramètre serveur, cf. docs/api.md). Page gated par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/residence/batiments/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	validateSearch: z.object({
		search: z.string().optional(),
		actif: z.enum(["tous", "actif", "inactif"]).optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: BatimentsRoutePage,
});

function BatimentsRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: BatimentsSearch) => BatimentsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<BuildingsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
