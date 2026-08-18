import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	EcheancesPage,
	type EcheancesSearch,
} from "#/features/residence/components/echeances-page";

/**
 * Suivi des échéances de loyer (M2.2). `statut`/`du`/`au` sont envoyés au
 * lister `/suivi` (params réels) ; filtre locataire et page côté client.
 * Page gated par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/residence/echeances/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	validateSearch: z.object({
		statut: z.string().optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		locataire: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: EcheancesRoutePage,
});

function EcheancesRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: EcheancesSearch) => EcheancesSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<EcheancesPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
