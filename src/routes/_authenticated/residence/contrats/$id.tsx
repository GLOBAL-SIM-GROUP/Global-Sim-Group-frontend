import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { ContratFichePage } from "#/features/residence/components/contrat-fiche-page";

/**
 * Fiche détaillée d'un contrat (M2.2). Pas de search param. Page gated par
 * `RESIDENCE.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/residence/contrats/$id")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RESIDENCE.VOIR");
	},
	component: ContratFicheRoutePage,
});

function ContratFicheRoutePage() {
	const { id } = Route.useParams();
	return <ContratFichePage id={id} />;
}
