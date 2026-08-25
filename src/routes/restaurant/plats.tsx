import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import {
	PlatsPage,
	type PlatsSearch,
} from "#/features/restaurant/components/plats-page";

/**
 * Carte publique des plats — Restaurant (M5).
 * Accessible sans authentification.
 */
export const Route = createFileRoute("/restaurant/plats")({
	validateSearch: z.object({
		categorie: z.string().optional(),
		dispo: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: PlatPublicRoutePage,
});

function PlatPublicRoutePage() {
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
