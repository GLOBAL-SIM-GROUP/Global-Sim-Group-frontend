import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	FacturationPonctuellePage,
	type FacturationSearch,
} from "#/features/facturation/components/facturation-ponctuelle-page";

/**
 * Factures — Facturation ponctuelle (M7/M12). Liste des factures (tous
 * modules confondus), recherche/filtres reflétés dans l'URL, bouton
 * « Nouvelle facture ponctuelle » et lignes cliquables vers la fiche.
 * Gated par `FACTURATION.VOIR`.
 *
 * `facturation-ponctuelle-page.tsx` est la page complète (création, fiche,
 * pagination) ; `factures-page.tsx` (l'ancien composant ici) est une version
 * plus simple, en lecture seule, restée orpheline — pas de bouton d'ajout,
 * c'était le bug signalé.
 */
export const Route = createFileRoute("/_authenticated/facturation/factures/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "FACTURATION.VOIR");
	},
	validateSearch: z.object({
		recherche: z.string().optional(),
		statut: z.string().optional(),
		source: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: FacturesRoutePage,
});

function FacturesRoutePage() {
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: FacturationSearch) => FacturationSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<FacturationPonctuellePage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
