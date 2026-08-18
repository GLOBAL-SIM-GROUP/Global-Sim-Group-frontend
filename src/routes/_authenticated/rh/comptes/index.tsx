import { createFileRoute } from "@tanstack/react-router";

import { requirePermissions } from "#/core/auth";
import { ComptesPage } from "#/features/rh/components/comptes-page";

/**
 * Comptes utilisateurs (M9.4). Pas de search param. Page gated par `RH.VOIR` ;
 * la création effective exige `ADMIN.CREER`.
 */
export const Route = createFileRoute("/_authenticated/rh/comptes/")({
	beforeLoad: ({ context }) => {
		requirePermissions(context.auth, "RH.VOIR");
	},
	component: ComptesRoutePage,
});

function ComptesRoutePage() {
	return <ComptesPage />;
}
