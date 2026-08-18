import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	ProduitsPage,
	type ProduitsSearch,
} from "#/features/marchandise/components/produits-page";

/**
 * Catalogue des produits — Market (M3). Filtres et page vivent dans l'URL pour
 * le partage de liens ; appliqués côté client. Page gated par `MARCHANDISE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/marchandise/produits/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "MARCHANDISE.VOIR");
	},
	validateSearch: z.object({
		categorie: z.string().optional(),
		fournisseur: z.string().optional(),
		alerte: z.enum(["tous", "alerte"]).optional(),
		epuises: z.enum(["tous", "epuises"]).optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: ProduitsRoutePage,
});

function ProduitsRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
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
