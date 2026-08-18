import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	AbonnementsPage,
	type AbonnementsSearch,
} from "#/features/residence/components/abonnements-page";

/**
 * Liste des abonnements (M2.4). Filtres et page vivent dans l'URL pour le
 * partage de liens ; appliqués côté client. Page gated par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/residence/abonnements/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	validateSearch: z.object({
		statut: z
			.enum(["tous", "ACTIF", "SUSPENDU", "RESILIE", "EXPIRE"])
			.optional(),
		locataire: z.string().optional(),
		service: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: AbonnementsRoutePage,
});

function AbonnementsRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: AbonnementsSearch) => AbonnementsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<AbonnementsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
