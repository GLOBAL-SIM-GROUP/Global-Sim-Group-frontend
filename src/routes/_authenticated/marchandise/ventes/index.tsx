import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	VentesPage,
	type VentesSearch,
} from "#/features/marchandise/components/ventes-page";

/**
 * Historique des ventes — Market (M3). Filtres et page vivent dans l'URL pour
 * le partage de liens ; appliqués côté client. Page gated par `MARCHANDISE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/marchandise/ventes/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "MARCHANDISE.VOIR");
	},
	validateSearch: z.object({
		statut: z.enum(["tous", "EN_COURS", "PAYEE", "ANNULEE"]).optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		client: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: VentesRoutePage,
});

function VentesRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (maj: (prev: VentesSearch) => VentesSearch) => void = (
		maj,
	) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<VentesPage initialSearch={initialSearch} onSearchChange={onSearchChange} />
	);
}
