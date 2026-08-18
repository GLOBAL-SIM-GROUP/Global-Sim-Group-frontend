import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requirePermissions } from "#/core/auth";
import {
	ContratsPage,
	type ContratsSearch,
} from "#/features/residence/components/contrats-page";

/**
 * Liste des contrats de location (M2.2). Filtres et page vivent dans l'URL
 * pour le partage de liens ; appliqués côté client (le lister ne documente
 * aucun paramètre serveur). Page gated par `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/residence/contrats/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	validateSearch: z.object({
		statut: z
			.enum(["tous", "EN_ATTENTE", "ACTIF", "EXPIRE", "RESILIE", "TERMINE"])
			.optional(),
		locataire: z.string().optional(),
		logement: z.string().optional(),
		du: z.string().optional(),
		au: z.string().optional(),
		page: z.coerce.number().int().positive().optional(),
	}),
	component: ContratsRoutePage,
});

function ContratsRoutePage() {
	// La page feature ne connaît pas la route : on lui passe les valeurs
	// initiales de l'URL et un moyen de la réécrire — la route reste de la colle.
	const initialSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const onSearchChange: (
		maj: (prev: ContratsSearch) => ContratsSearch,
	) => void = (maj) => {
		void navigate({ search: (prev) => maj(prev) });
	};
	return (
		<ContratsPage
			initialSearch={initialSearch}
			onSearchChange={onSearchChange}
		/>
	);
}
