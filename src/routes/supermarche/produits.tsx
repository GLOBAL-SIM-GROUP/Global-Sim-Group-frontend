import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import {
	ProduitsPage,
	type ProduitsSearch,
} from "#/features/marchandise/components/produits-page";

/**
 * Catalogue public des produits — Market (M3).
 * Accessible sans authentification.
 */
export const Route = createFileRoute("/marchandise/produits")({
	validateSearch: z.object({
		categorie: z.string().optional(),
		fournisseur: z.string().optional(),
		alerte: z.enum(["tous", "alerte"]).optional(),
		epuises: z.enum(["tous", "epuises"]).optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: ProduitsPublicRoutePage,
});

function ProduitsPublicRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: ProduitsSearch) => ProduitsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<ProduitsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
