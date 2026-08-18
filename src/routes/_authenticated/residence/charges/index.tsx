import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	ChargesPage,
	type ChargesSearch,
} from "#/features/residence/components/charges-page";

/**
 * Liste des charges facturées (M2.4). Filtres et page vivent dans l'URL pour
 * le partage de liens ; appliqués côté client. Page gated par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/residence/charges/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	validateSearch: z.object({
		statut: z.string().optional(),
		logement: z.string().optional(),
		periode: z.string().optional(),
		categorie: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: ChargesRoutePage,
});

function ChargesRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (maj: (prev: ChargesSearch) => ChargesSearch) => void =
		(maj) => {
			void navigate({ search: (prev) => maj(prev) });
		};
	return (
		<ChargesPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
