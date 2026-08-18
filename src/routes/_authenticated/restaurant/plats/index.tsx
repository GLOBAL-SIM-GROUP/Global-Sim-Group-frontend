import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	PlatsPage,
	type PlatsSearch,
} from "#/features/restaurant/components/plats-page";

/**
 * Carte des plats — Restaurant (M5). Filtres et page vivent dans l'URL ;
 * appliqués côté client. Page gated par `RESTAURANT.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/restaurant/plats/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESTAURANT.VOIR");
	},
	validateSearch: z.object({
		categorie: z.string().optional(),
		dispo: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: PlatsRoutePage,
});

function PlatsRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (maj: (prev: PlatsSearch) => PlatsSearch) => void = (
		maj,
	) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<PlatsPage initialSearch={initialSearch} onSearchChange={onSearchChange} />
	);
}
