import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	LogementFichePage,
	type LogementFicheSearch,
} from "#/features/residence/components/logement-fiche-page";

/**
 * Fiche détaillée d'un logement (M2.2). L'onglet actif vit dans l'URL
 * (`?onglet=`) pour le partage. Page gated par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/residence/logements/$id")(
	{
		beforeLoad: ({ context }) => {
			requirePermissions(context.auth, "RESIDENCE.VOIR");
		},
		validateSearch: z.object({
			onglet: z.enum(["occupations", "charges"]).optional(),
		}),
		component: LogementFicheRoutePage,
	},
);

function LogementFicheRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const { id } = Route.useParams();
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: LogementFicheSearch) => LogementFicheSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<LogementFichePage
			id={id}
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
