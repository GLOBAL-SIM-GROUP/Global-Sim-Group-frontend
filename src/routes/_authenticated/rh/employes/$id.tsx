import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { EmployeFichePage } from "#/features/rh/components/employe-fiche-page";

/**
 * Fiche employé — RH (M9.1). Pas de search param. Page gated par `RH.VOIR`.
 */
export const Route = createFileRoute("/_authenticated/rh/employes/$id")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RH.VOIR");
	},
	component: EmployeFicheRoutePage,
});

function EmployeFicheRoutePage() {
	const { id } = Route.useParams();
	return <EmployeFichePage id={id} />;
}
